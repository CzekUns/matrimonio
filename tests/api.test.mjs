import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import worker from "../worker/src/index.js";

const base="https://matrimonio.example";
const pepper="un-pepper-lungo-solo-per-i-test-automatici";
const code="ABCDEF1234567890AB";
const digest=createHash("sha256").update(pepper+":"+code).digest("hex");
const invitation={id:"i-1",user_id:"u-1",display_name:"Invitato Test",role:"guest",expires_at:null};
function dbMock(){
  const state={used:false,sessions:new Map()};
  const DB={
    prepare(sql){
      let args=[];
      return {
        bind(...values){args=values;return this;},
        async first(){
          if(sql.startsWith("SELECT invite_codes"))return args[0]===digest&&!state.used?invitation:null;
          if(sql.startsWith("SELECT users.id"))return state.sessions.has(args[0])?{id:"u-1",display_name:"Invitato Test",role:"guest"}:null;
          return null;
        },
        async run(){
          if(sql.startsWith("UPDATE invite_codes")){
            if(state.used)return {meta:{changes:0}};
            state.used=true;return {meta:{changes:1}};
          }
          if(sql.startsWith("INSERT INTO sessions")){state.sessions.set(args[0],args[1]);return {meta:{changes:1}};}
          if(sql.startsWith("UPDATE sessions")){state.sessions.delete(args[1]);return {meta:{changes:1}};}
          return {meta:{changes:1}};
        }
      };
    }
  };
  return DB;
}
test("health endpoint exists without DB",async()=>{
  const response=await worker.fetch(new Request(base+"/api/health"),{ASSETS:{}});
  assert.equal(response.status,200);
  const data=await response.json();
  assert.equal(data.service,"matrimonio-api");
});
test("private endpoints reject without a database",async()=>{
  const response=await worker.fetch(new Request(base+"/api/me"),{ASSETS:{}});
  assert.equal(response.status,503);
});
test("one-time invite creates session, second redeem fails",async()=>{
  const env={DB:dbMock(),INVITE_PEPPER:pepper,ASSETS:{}};
  const request=()=>new Request(base+"/api/auth/redeem",{
    method:"POST",headers:{"Content-Type":"application/json","Origin":base},
    body:JSON.stringify({code:"ABCDEF-123456-7890AB"})
  });
  const first=await worker.fetch(request(),env);
  assert.equal(first.status,200);
  const cookie=first.headers.get("set-cookie");
  assert.match(cookie,/HttpOnly/);
  assert.match(cookie,/SameSite=Lax/);
  const me=await worker.fetch(new Request(base+"/api/me",{headers:{Cookie:cookie.split(";")[0]}}),env);
  assert.equal(me.status,200);
  assert.equal((await me.json()).user.display_name,"Invitato Test");
  const second=await worker.fetch(request(),env);
  assert.equal(second.status,401);
});
test("guest cannot publish organizer announcements",async()=>{
  const env={DB:dbMock(),INVITE_PEPPER:pepper,ASSETS:{}};
  const redeemed=await worker.fetch(new Request(base+"/api/auth/redeem",{
    method:"POST",headers:{Origin:base,"Content-Type":"application/json"},
    body:JSON.stringify({code})
  }),env);
  const cookie=redeemed.headers.get("set-cookie").split(";")[0];
  const response=await worker.fetch(new Request(base+"/api/announcements",{
    method:"POST",headers:{Origin:base,Cookie:cookie,"Content-Type":"application/json"},
    body:JSON.stringify({text:"Questo non deve essere pubblicato"})
  }),env);
  assert.equal(response.status,403);
});
