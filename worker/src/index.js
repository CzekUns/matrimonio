/*
 * Matrimonio API - Cloudflare Workers + D1.
 * Production scope of this milestone: invitation redeem, sessions, read-only
 * chronological feed, organizer announcements. No real media or push yet.
 */
const json = (data,status=200,headers={})=>new Response(JSON.stringify(data),{
  status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",
    "X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer",...headers}
});
const fail=(message,status=400)=>json({error:message},status);
const hash=async input=>{
  const bytes=new TextEncoder().encode(input);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
};
const randomToken=()=>{
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
};
const cookieValue=(request,name)=>{
  const raw=request.headers.get("Cookie")||"";
  return raw.split(";").map(s=>s.trim()).find(s=>s.startsWith(name+"="))?.slice(name.length+1)||"";
};
const cookie=(token,seconds)=>"matrimonio_session="+encodeURIComponent(token)+"; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age="+seconds;
const asJson=async request=>{
  if(Number(request.headers.get("Content-Length")||0)>4096)throw Error("Richiesta troppo grande");
  return request.json().catch(()=>{throw Error("JSON non valido")});
};
async function currentUser(req,env){
  const token=cookieValue(req,"matrimonio_session");
  if(!/^[a-f0-9]{64}$/.test(token))return null;
  const digest=await hash(token);
  return env.DB.prepare(
    "SELECT users.id, users.display_name, users.role FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.revoked_at IS NULL AND sessions.expires_at > ?"
  ).bind(digest,Date.now()).first();
}
async function redeem(req,env){
  if(!env.INVITE_PEPPER)return fail("INVITE_PEPPER non configurato",503);
  const body=await asJson(req);
  const code=String(body.code||"").toUpperCase().replace(/[\s-]/g,"");
  if(!/^[A-F0-9]{18}$/.test(code))return fail("Codice non valido",401);
  const digest=await hash(env.INVITE_PEPPER+":"+code);
  const invitation=await env.DB.prepare(
    "SELECT invite_codes.id,invite_codes.user_id,invite_codes.expires_at,users.display_name,users.role FROM invite_codes JOIN users ON users.id=invite_codes.user_id WHERE invite_codes.code_hash=? AND invite_codes.used_at IS NULL"
  ).bind(digest).first();
  if(!invitation||invitation.expires_at&&invitation.expires_at<Date.now())return fail("Codice scaduto o già utilizzato",401);
  const updated=await env.DB.prepare("UPDATE invite_codes SET used_at=? WHERE id=? AND used_at IS NULL").bind(Date.now(),invitation.id).run();
  if((updated.meta?.changes||0)!==1)return fail("Codice già utilizzato",409);
  const token=randomToken();const tokenHash=await hash(token);const ttl=60*60*24*30;
  await env.DB.prepare("INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(?,?,?,?)")
    .bind(tokenHash,invitation.user_id,Date.now(),Date.now()+ttl*1000).run();
  return json({user:{id:invitation.user_id,display_name:invitation.display_name,role:invitation.role}},200,{"Set-Cookie":cookie(token,ttl)});
}
async function logout(req,env){
  const token=cookieValue(req,"matrimonio_session");
  if(/^[a-f0-9]{64}$/.test(token)){
    await env.DB.prepare("UPDATE sessions SET revoked_at=? WHERE token_hash=?")
      .bind(Date.now(),await hash(token)).run();
  }
  return json({ok:true},200,{"Set-Cookie":cookie("",0)});
}
async function route(req,env){
  const url=new URL(req.url);const path=url.pathname;const method=req.method.toUpperCase();
  if(path==="/api/health"&&method==="GET")return json({service:"matrimonio-api",version:"0.1.0"});
  if(!env.DB)return fail("Collegamento D1 non configurato",503);
  if(method!=="GET"&&method!=="HEAD"){
    const origin=req.headers.get("Origin");
    const expected=env.APP_ORIGIN||url.origin;
    if(origin&&origin!==expected)return fail("Origin non consentita",403);
    if(!["POST"].includes(method))return fail("Metodo non consentito",405);
  }
  if(path==="/api/auth/redeem"&&method==="POST")return redeem(req,env);
  if(path==="/api/auth/logout"&&method==="POST")return logout(req,env);
  const user=await currentUser(req,env);
  if(!user)return fail("Accesso riservato agli invitati",401);
  if(path==="/api/me"&&method==="GET")return json({user});
  if(path==="/api/feed"&&method==="GET"){
    const posts=await env.DB.prepare(
      "SELECT posts.id,posts.kind,posts.caption,posts.media_url,posts.created_at,users.display_name AS user_name FROM posts JOIN users ON users.id=posts.user_id WHERE posts.status='published' ORDER BY posts.created_at DESC LIMIT 50"
    ).all();
    return json({posts:posts.results||[]});
  }
  if(path==="/api/announcements"&&method==="GET"){
    const notes=await env.DB.prepare(
      "SELECT announcements.id,announcements.text,announcements.created_at,users.display_name AS author_name FROM announcements JOIN users ON users.id=announcements.author_id ORDER BY announcements.created_at DESC LIMIT 50"
    ).all();
    return json({announcements:notes.results||[]});
  }
  if(path==="/api/announcements"&&method==="POST"){
    if(!["organizer","helper"].includes(user.role))return fail("Permesso insufficiente",403);
    const body=await asJson(req);const text=String(body.text||"").trim();
    if(!text||text.length>500)return fail("Messaggio richiesto, massimo 500 caratteri",400);
    const id=crypto.randomUUID();
    await env.DB.prepare("INSERT INTO announcements(id,author_id,text,created_at) VALUES(?,?,?,?)")
      .bind(id,user.id,text,new Date().toISOString()).run();
    return json({ok:true,id,push_status:"not_implemented"},201);
  }
  if(path.startsWith("/api/uploads/")||path.startsWith("/api/push/"))
    return fail("Integrazione non ancora attivata. Vedi docs/BACKLOG.md",501);
  return fail("Endpoint inesistente",404);
}
export default {
  async fetch(request,env){
    try{
      const url=new URL(request.url);
      if(url.pathname.startsWith("/api/"))return await route(request,env);
      return env.ASSETS.fetch(request);
    }catch(error){
      // Do not leak secrets/stack traces to visitors.
      console.error("Matrimonio API error:",error?.message);
      return fail("Errore interno. Contattare l'organizzatore.",500);
    }
  }
};
