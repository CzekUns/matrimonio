/*
 * Genera utenti e codici invito one-time. ESEGUIRE SOLO IN LOCALE.
 * Richiede la stessa INVITE_PEPPER segreta impostata nel Worker.
 * Salva CSV con codici in private-output/, esclusa da .gitignore.
 */
import {randomBytes,randomUUID,createHash} from "node:crypto";
import {mkdir,writeFile} from "node:fs/promises";
const pepper=process.env.INVITE_PEPPER;
if(!pepper||pepper.length<24)throw Error("Imposta INVITE_PEPPER (almeno 24 caratteri) prima di generare i codici.");
const count=Number(process.argv[2]||200);
if(!Number.isInteger(count)||count<1||count>1000)throw Error("Numero di ospiti non valido.");
const guests=Array.from({length:count},(_,i)=>({name:"Invitato "+String(i+1).padStart(3,"0"),role:"guest"}));
guests.push({name:"Organizzatore 1",role:"organizer"},{name:"Organizzatore 2",role:"organizer"},{name:"Collaboratore",role:"helper"});
const escapeSql=s=>"'"+String(s).replaceAll("'","''")+"'";
const sql=["-- Importa dopo worker/schema.sql; NON pubblicare il CSV dei codici.",
  "BEGIN TRANSACTION;"];
const csv=["nome,ruolo,codice,qr_url"];
for(const guest of guests){
  const userId=randomUUID(),inviteId=randomUUID();
  const unformatted=randomBytes(9).toString("hex").toUpperCase();
  const code=unformatted.match(/.{1,6}/g).join("-");
  const digest=createHash("sha256").update(pepper+":"+unformatted).digest("hex");
  sql.push("INSERT INTO users(id,display_name,role) VALUES("+[userId,guest.name,guest.role].map(escapeSql).join(",")+");");
  sql.push("INSERT INTO invite_codes(id,user_id,code_hash) VALUES("+[inviteId,userId,digest].map(escapeSql).join(",")+");");
  csv.push([guest.name,guest.role,code,"https://URL-DELL-APP/#invite="+encodeURIComponent(code)].map(v=>'"'+v.replaceAll('"','""')+'"').join(","));
}
sql.push("COMMIT;");
await mkdir("private-output",{recursive:true});
await writeFile("private-output/inviti-import.sql",sql.join("\n")+"\n",{mode:0o600});
await writeFile("private-output/inviti-privati.csv",csv.join("\n")+"\n",{mode:0o600});
console.log("Creati",guests.length,"utenti: ",count,"ospiti e 3 organizzatori/collaboratori.");
console.log("File riservati: private-output/inviti-import.sql e private-output/inviti-privati.csv");
console.log("Personalizza nomi e URL prima della distribuzione. NON committare questi file.");
