const $ = (id) => document.getElementById(id);
const state = {
  demo: true, user: null, view: "feed", mode: "photo", stream: null,
  recorder: null, chunks: [], timer: null, startedAt: 0, recording: false,
  facing: "environment", pending: null, pendingUrl: null, posts: [], alerts: []
};
const samplePosts = [
  {id:"demo-1",user_name:"Il nostro matrimonio",kind:"text",caption:"Qui appariranno i ricordi condivisi dagli invitati, dal più recente. Scatta il primo!",created_at:new Date().toISOString(),demo:true}
];
const sampleAlerts = [{id:"demo-alert",text:"Benvenuti! Qui gli sposi potranno pubblicare indicazioni, orari e messaggi per gli invitati.",created_at:new Date().toISOString(),author_name:"Gli organizzatori"}];
const fmt = (s) => {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "Ora" : d.toLocaleString("it-IT",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
};
function toast(message) {
  const t=$("toast");t.textContent=message;t.classList.add("show");
  clearTimeout(toast._timer);toast._timer=setTimeout(()=>t.classList.remove("show"),4000);
}
async function api(path,options={}) {
  const response=await fetch("/api"+path,{
    credentials:"same-origin",
    ...options,
    headers:{"Content-Type":"application/json",...(options.headers||{})}
  });
  const data=await response.json().catch(()=>({error:"Risposta server non valida"}));
  if(!response.ok) throw new Error(data.error||"Richiesta non riuscita");
  return data;
}
function view(name) {
  if(state.view==="capture"&&name!=="capture")stopCamera();
  state.view=name;
  for(const id of ["feed","capture","alerts","profile"]) $(id+"-view").hidden=id!==name;
  document.querySelectorAll(".nav-item").forEach(btn=>btn.classList.toggle("active",btn.dataset.view===name));
  if(name==="feed")renderFeed();
  if(name==="alerts")renderAlerts();
  if(name==="profile")renderProfile();
  window.scrollTo({top:0,behavior:"smooth"});
}
function enter(user) {
  state.user=user;$("welcome").hidden=true;$("app").hidden=false;
  $("demo-banner").hidden=!state.demo;
  renderProfile();renderFeed();renderAlerts();view("feed");
}
function logoutLocal() {
  stopCamera();state.user=null;$("app").hidden=true;$("welcome").hidden=false;
}
function renderProfile() {
  if(!state.user)return;
  $("profile-name").textContent=(state.user.display_name||"invitato").split(" ")[0]+".";
  $("profile-role").textContent=({guest:"Invitato",organizer:"Sposi / Organizzatore",helper:"Collaboratore autorizzato"})[state.user.role]||"Invitato";
  $("demo-admin").hidden=!state.demo||state.user.role!=="guest";
  $("demo-guest").hidden=!state.demo||state.user.role==="guest";
  $("admin-panel").hidden=!["organizer","helper"].includes(state.user.role);
}
function create(tag,cls,text) {
  const el=document.createElement(tag);if(cls)el.className=cls;
  if(text!==undefined)el.textContent=text;return el;
}
function renderFeed() {
  const list=$("feed-list");list.replaceChildren();
  if(!state.posts.length){list.append(create("div","empty","Ancora nessun ricordo. Scatta la prima foto!"));return;}
  for(const post of state.posts) {
    const card=create("article","post");
    const head=create("div","post-head");
    head.append(create("div","avatar","♥"));
    const who=create("div");who.append(create("strong","",post.user_name||"Invitato"),create("small","",fmt(post.created_at)));
    head.append(who);card.append(head);
    if(post.mediaUrl||post.media_url) {
      const url=post.mediaUrl||post.media_url;
      // I link remoti arrivano soltanto dal backend; in demo usiamo blob: locali.
      if(post.kind==="photo"){
        const img=create("img","post-media");img.src=url;img.alt="Fotografia condivisa da "+(post.user_name||"un invitato");img.loading="lazy";card.append(img);
      } else if(post.kind==="video"){
        const vid=create("video","post-media video");vid.src=url;vid.controls=true;vid.preload="none";vid.playsInline=true;card.append(vid);
      } else if(post.kind==="audio"){
        const wrap=create("div","post-bottom");wrap.append(create("p","","Messaggio vocale"));
        const audio=create("audio");audio.src=url;audio.controls=true;audio.preload="none";audio.style.width="100%";wrap.append(audio);card.append(wrap);
      }
    } else if(post.kind==="text") {
      card.append(create("div","post-placeholder",state.demo?"Il nostro giorno ♡":"Un ricordo speciale"));
    }
    if(post.caption){const foot=create("div","post-bottom");foot.append(create("p","",post.caption));card.append(foot);}
    list.append(card);
  }
}
function renderAlerts() {
  const list=$("alerts-list");list.replaceChildren();
  if(!state.alerts.length){list.append(create("div","empty","Nessun avviso degli organizzatori."));return;}
  for(const item of state.alerts) {
    const card=create("article","alert-card");
    card.append(create("strong","",item.author_name||"Organizzatori"),create("p","",item.text),create("small","",fmt(item.created_at)));
    list.append(card);
  }
}
async function refreshLive() {
  try{
    const [feed,alerts]=await Promise.all([api("/feed"),api("/announcements")]);
    state.posts=feed.posts||[];state.alerts=alerts.announcements||[];
    renderFeed();renderAlerts();
  }catch(e){toast("Impossibile aggiornare il feed: "+e.message);}
}
async function startCamera() {
  stopCamera();
  if(!navigator.mediaDevices?.getUserMedia){toast("Fotocamera non disponibile: serve HTTPS e un browser compatibile.");return;}
  try{
    state.stream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:{ideal:state.facing},width:{ideal:1280},height:{ideal:720}},
      audio:state.mode==="video"
    });
    const preview=$("camera-preview");preview.srcObject=state.stream;preview.hidden=false;await preview.play();
    $("camera-placeholder").hidden=true;$("camera-start").hidden=true;$("camera-flip").hidden=false;
    $("camera-status").textContent=state.mode==="video"?"Pronto per registrare":"Pronto per scattare";
    $("capture-button").disabled=false;
  }catch(e){toast("Permesso fotocamera negato o dispositivo non disponibile.");}
}
function stopCamera(){
  if(state.recording&&state.recorder?.state==="recording"){state.recorder.stop();}
  if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}
  $("camera-preview").srcObject=null;$("camera-preview").hidden=true;$("camera-placeholder").hidden=false;
  $("camera-start").hidden=false;$("camera-flip").hidden=true;
  if(state.mode!=="audio")$("capture-button").disabled=true;
  $("camera-status").textContent="Fotocamera da avviare";
  clearInterval(state.timer);state.timer=null;$("record-timer").hidden=true;
}
function setMode(mode){
  if(state.recording){toast("Termina la registrazione prima di cambiare modalità.");return;}
  stopCamera();state.mode=mode;
  document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  $("camera-start").hidden=mode==="audio";
  $("camera-placeholder").innerHTML="";
  $("camera-placeholder").append(create("span","camera-glyph",mode==="audio"?"♫":"◎"),create("p","",mode==="audio"?"Registra un messaggio vocale":"La fotocamera si avvia solo quando lo scegli tu"));
  $("camera-status").textContent=mode==="audio"?"Microfono da avviare":"Fotocamera da avviare";
  $("capture-button").disabled=mode!=="audio";
  $("capture-button").setAttribute("aria-label",mode==="photo"?"Scatta foto":"Avvia o ferma registrazione");
  $("capture-help").textContent=mode==="audio"?"Premi per registrare la tua voce.":"Niente caricamenti dalla galleria: i ricordi nascono qui.";
}
function stopRecording(){
  if(!state.recording)return;
  state.recording=false;clearInterval(state.timer);state.timer=null;
  $("capture-button").classList.remove("recording");$("record-timer").hidden=true;
  if(state.recorder?.state==="recording")state.recorder.stop();
}
async function beginRecording(){
  if(typeof MediaRecorder==="undefined"){toast("Registrazione non supportata da questo browser.");return;}
  let stream=state.stream;
  if(state.mode==="audio"){
    try{stream=await navigator.mediaDevices.getUserMedia({audio:true});state.stream=stream;}
    catch{toast("Consenti l'accesso al microfono.");return;}
  }
  if(!stream){toast("Attiva prima la fotocamera.");return;}
  try{
    const choices=state.mode==="audio"?["audio/webm;codecs=opus","audio/mp4","audio/webm"]:["video/webm;codecs=vp8,opus","video/mp4","video/webm"];
    const mimeType=choices.find(t=>MediaRecorder.isTypeSupported(t));
    const recorder=new MediaRecorder(stream,mimeType?{mimeType,...(state.mode==="video"?{videoBitsPerSecond:1200000}:{audioBitsPerSecond:64000})}:{});
    state.chunks=[];state.recorder=recorder;state.recording=true;state.startedAt=Date.now();
    recorder.ondataavailable=(event)=>{if(event.data?.size)state.chunks.push(event.data);};
    recorder.onerror=()=>toast("Errore durante la registrazione.");
    recorder.onstop=()=>{
      const blob=new Blob(state.chunks,{type:recorder.mimeType|| (state.mode==="audio"?"audio/webm":"video/webm")});
      clearInterval(state.timer);state.timer=null;state.recording=false;
      state.stream?.getTracks().forEach(t=>t.stop());state.stream=null;
      $("capture-button").classList.remove("recording");
      $("camera-preview").hidden=true;$("camera-start").hidden=false;$("camera-placeholder").hidden=false;
      $("capture-button").disabled=state.mode!=="audio";
      if(blob.size)review(blob,state.mode);else toast("Registrazione vuota: riprova.");
    };
    recorder.start(1000);
    $("record-timer").hidden=false;$("capture-button").classList.add("recording");
    const maxSeconds=60;
    state.timer=setInterval(()=>{
      const seconds=Math.min(maxSeconds,Math.floor((Date.now()-state.startedAt)/1000));
      $("record-timer").textContent="00:"+String(seconds).padStart(2,"0")+" / 01:00";
      if(seconds>=maxSeconds)stopRecording();
    },250);
  }catch(e){state.recording=false;toast("Questo formato video non è supportato.");}
}
async function capture(){
  if(state.recording){stopRecording();return;}
  if(state.mode!=="photo"){await beginRecording();return;}
  if(!state.stream){toast("Attiva prima la fotocamera.");return;}
  const video=$("camera-preview");if(!video.videoWidth){toast("La fotocamera si sta avviando.");return;}
  const ratio=Math.min(1,1600/Math.max(video.videoWidth,video.videoHeight));
  const canvas=document.createElement("canvas");
  canvas.width=Math.round(video.videoWidth*ratio);canvas.height=Math.round(video.videoHeight*ratio);
  canvas.getContext("2d").drawImage(video,0,0,canvas.width,canvas.height);
  canvas.toBlob(blob=>{if(blob)review(blob,"photo");else toast("Impossibile acquisire la foto.");},"image/jpeg",.82);
}
function review(blob,kind){
  if(state.pendingUrl)URL.revokeObjectURL(state.pendingUrl);
  state.pending={blob,kind};state.pendingUrl=URL.createObjectURL(blob);
  const panel=$("review-media");panel.replaceChildren();
  const media=create(kind==="photo"?"img":kind==="video"?"video":"audio");
  media.src=state.pendingUrl;
  if(kind==="photo")media.alt="Anteprima della foto";
  else {media.controls=true;if(kind==="video")media.playsInline=true;}
  panel.append(media);$("post-caption").value="";
  $("review-note").textContent=state.demo?"Anteprima locale: il post scomparirà alla ricarica.":"Collegamento agli archivi ancora da attivare: la pubblicazione è temporaneamente disabilitata.";
  $("review-publish").disabled=!state.demo;
  $("review-dialog").showModal();
}
async function publish(){
  if(!state.pending||!state.demo)return;
  const {kind}=state.pending;
  const url=URL.createObjectURL(state.pending.blob);
  state.posts.unshift({id:crypto.randomUUID(),user_name:state.user.display_name,kind,mediaUrl:url,caption:$("post-caption").value.trim(),created_at:new Date().toISOString()});
  $("review-dialog").close();state.pending=null;
  if(state.pendingUrl)URL.revokeObjectURL(state.pendingUrl);state.pendingUrl=null;
  stopCamera();view("feed");toast("Ricordo aggiunto alla demo (non salvato online).");
}
function updateRole(role){state.user.role=role;renderProfile();renderAlerts();toast("Ruolo simulato: nessun permesso reale modificato.");}
async function initialize(){
  if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("/sw.js").catch(()=>{});
  const hash=new URLSearchParams(location.hash.slice(1));const invite=hash.get("invite");
  if(invite){$("invite-code").value=invite;history.replaceState(null,"",location.pathname+location.search);}
  try{
    const res=await fetch("/api/health",{cache:"no-store"});
    if(res.ok&&(await res.json()).service==="matrimonio-api")state.demo=false;
  }catch{/* front-end standalone, only demo available */}
  $("demo-enter").hidden=!state.demo;
  $("welcome-status").textContent=state.demo?"Demo grafica: nessun account, archivio o upload reale è collegato.":"Inserisci il codice ricevuto dagli organizzatori.";
  if(!state.demo){try{const result=await api("/me");enter(result.user);await refreshLive();}catch{/* login richiesto */}}
}
$("invite-form").addEventListener("submit",async e=>{
  e.preventDefault();
  if(state.demo){toast("La demo non verifica codici: premi Esplora la demo.");return;}
  const btn=e.currentTarget.querySelector("button");btn.disabled=true;
  try{const data=await api("/auth/redeem",{method:"POST",body:JSON.stringify({code:$("invite-code").value.trim()})});enter(data.user);await refreshLive();}
  catch(err){toast(err.message);}
  finally{btn.disabled=false;}
});
$("demo-enter").addEventListener("click",()=>{state.posts=[...samplePosts];state.alerts=[...sampleAlerts];enter({id:"demo",display_name:"Invitato",role:"guest"});});
document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>view(btn.dataset.view)));
$("notifications-button").addEventListener("click",()=>view("alerts"));
$("composer-open").addEventListener("click",()=>view("capture"));
$("camera-start").addEventListener("click",startCamera);
$("camera-flip").addEventListener("click",()=>{state.facing=state.facing==="user"?"environment":"user";startCamera();});
document.querySelectorAll(".mode").forEach(btn=>btn.addEventListener("click",()=>setMode(btn.dataset.mode)));
$("capture-button").addEventListener("click",capture);
$("review-retake").addEventListener("click",()=>{$("review-dialog").close();if(state.pendingUrl)URL.revokeObjectURL(state.pendingUrl);state.pendingUrl=null;state.pending=null;});
$("review-publish").addEventListener("click",publish);
$("alert-form").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!["organizer","helper"].includes(state.user?.role))return;
  const text=$("alert-text").value.trim();if(!text)return;
  if(state.demo){
    state.alerts.unshift({id:crypto.randomUUID(),text,created_at:new Date().toISOString(),author_name:state.user.display_name});
    $("alert-text").value="";renderAlerts();toast("Avviso aggiunto alla demo. Nessuna push inviata.");return;
  }
  try{await api("/announcements",{method:"POST",body:JSON.stringify({text})});$("alert-text").value="";await refreshLive();toast("Avviso pubblicato. Push non ancora configurate.");}
  catch(e){toast(e.message);}
});
$("demo-admin").addEventListener("click",()=>updateRole("organizer"));
$("demo-guest").addEventListener("click",()=>updateRole("guest"));
$("logout").addEventListener("click",async()=>{if(!state.demo)try{await api("/auth/logout",{method:"POST",body:"{}"});}catch{}logoutLocal();});
window.addEventListener("pagehide",stopCamera);
$("review-dialog").addEventListener("close",()=>{if(state.pending&&!state.demo){if(state.pendingUrl)URL.revokeObjectURL(state.pendingUrl);state.pending=null;state.pendingUrl=null;}});
initialize();
