# SETUP — collegamenti e deploy passo per passo

Nessuna credenziale è attualmente inserita nel codice. I sistemi Google Drive, Wistia e push NON sono ancora attivi. Tutti i token vanno trattati come segreti, mai inseriti nel repository pubblico.

## 1. Vedere la DEMO su Vercel (solo frontend)
1. Aprire https://vercel.com e scegliere Add New Project.
2. Importare il repo GitHub CzekUns/matrimonio.
3. Il progetto è statico, nessun framework: il file vercel.json punta alla cartella public.
4. Eseguire Deploy. Visitare il sito HTTPS, fare clic su Esplora la demo.
5. La demo permette la fotocamera reale ma NON salva i media in remoto, e NON autentica ospiti.

Non usare la demo per la distribuzione dei QR agli invitati.

## 2. Backend + sito sullo stesso dominio Cloudflare (consigliato)
Richiede Node.js e accesso a Cloudflare.

1. Clonare la repo e digitare npm install.
2. Accedere con npx wrangler login.
3. Creare D1 con npx wrangler d1 create matrimonio-db.
4. Copiare ID D1 restituito dentro wrangler.jsonc, sostituendo REPLACE_WITH_D1_DATABASE_ID.
5. Applicare schema con npm run db:remote. In locale usare npm run db:local.
6. Creare una stringa segreta casuale lunga almeno 24 caratteri chiamata INVITE_PEPPER. Impostarla su Cloudflare con npx wrangler secret put INVITE_PEPPER.
7. Usando ESATTAMENTE lo stesso valore di INVITE_PEPPER, generare localmente gli inviti:
   PowerShell: $env:INVITE_PEPPER="SEGRETO_PRIVATO"; npm run invites -- 200
   Bash: INVITE_PEPPER="SEGRETO_PRIVATO" npm run invites -- 200
8. Lo script scrive private-output/inviti-import.sql e private-output/inviti-privati.csv. Questi sono RISERVATI e ignorati da Git.
9. Importare database con npx wrangler d1 execute matrimonio-db --remote --file private-output/inviti-import.sql.
10. Pubblicare con npm run deploy. L'URL workers.dev HTTPS servirà frontend + API sullo stesso dominio.
11. Provare /api/health, poi codice invito, poi ricarica pagina e logout. Un QR non deve poter essere riscattato due volte.
12. Per stampare QR, usare per ogni codice l'indirizzo https://DOMINIO/#invite=CODICE. Sostituire l'URL placeholder presente nel CSV. Generare QR solo in un ambiente privato.

Per i nomi reali sostituire localmente le etichette Invito 001 ecc. o importare gli utenti personalizzati senza rendere pubblici i nominativi. La sessione dopo il primo accesso dura 30 giorni nella base corrente; adattare scadenza e gestione recupero prima dell'evento.

### Vercel per produzione?
Vercel è ottimo per lo statico, ma il backend D1 vive in Cloudflare. Per mantenerli su Vercel occorre aggiungere un reverse proxy SAME ORIGIN /api/* verso il Worker e testare cookie/Origin/TLS. Tale proxy non è implementato al momento. La strada più corta è il deploy all-in-one Cloudflare.

## 3. Collegamento Google Drive — ancora da implementare (#3)
1. Verificare che sul Google One 100 GB dell'organizzatore resti spazio sufficiente; si condivide con Gmail/Foto.
2. Creare cartella Drive dedicata, privata (Originali matrimonio).
3. Aprire https://console.cloud.google.com, creare progetto, abilitare Drive API.
4. Configurare consenso OAuth, client web e redirect URL HTTPS del backend.
5. Fare login OAuth UNA volta con l'account proprietario, mai con ciascun invitato.
6. Implementare lato Worker OAuth Authorization Code server-side e refresh token, conservato in secret Cloudflare. Applicare scope minimo idoneo, verificando drive.file e cartella scelta.
7. Implementare Google Drive resumable uploads, retry, idempotenza e conferma drive_file_id in D1.
8. Testare originali di foto, video 60s e audio e limiti di richieste.
9. Fino a completamento #3, il tasto Pubblica in live resta disabilitato per non promettere salvati inesistenti.

## 4. Wistia video low-res — ancora da implementare (#4)
1. Creare account su https://wistia.com e verificare quote del Free e accesso alle API con l'account reale.
2. Creare folder riservato ai video del matrimonio.
3. Creare token Wistia permanente con scope solo upload, custodito come secret SERVER.
4. L'API consente expiring tokens con scadenza breve e required_params project_id; usare quelli nel browser per invio diretto, NON il permanente.
5. Registrare hashed_id Wistia in D1; attendere lo stato ready prima che un player compaia.
6. Abilitare restrizioni dominio, verificare referrer policy, testare aprendo un URL video fuori dall'app.
7. Prima di uso reale, valutare se la privacy Wistia soddisfa il requisito di accesso limitato ai 200 invitati. Le restrizioni di dominio NON garantiscono privacy forte.
8. Misurare volumi upload/playback e quote mensili; non attivare abbonamenti a pagamento senza consenso.

## 5. Foto, audio e feed — issue #5
Originali su Drive. Miniature/foto leggere e audio nel feed richiedono routing via backend autenticato o provider idoneo: è ancora una scelta da collaudare. Non usare D1 per BLOB. Non aprire cartelle Drive al pubblico.

## 6. Notifiche push — issue #6
Generare VAPID keys, salvare secrets, endpoint subscribe/revoke autenticati, invii con retry e consenso opt-in. iPhone: prima installare PWA con Aggiungi alla schermata Home. Gli avvisi testuali sono già previsti da backend, ma la push non è ancora collegata.

## 7. Verifica finale — issue #7
Eseguire docs/TESTPLAN.md con iPhone e Android reali. Simulare 200 sessioni, misurare bande Wistia, quote Google Drive e Cloudflare, provare accessi esterni e fallimenti upload. Solo dopo approvazione il sito è pronto per il matrimonio.
