# Architettura PWA e media

## Vista generale
- App mobile-first: static assets Cloudflare Worker; Vercel può ospitare una demo HTML statica.
- API same-origin: Cloudflare Worker, database D1. L'app utilizza session cookie Secure HttpOnly SameSite=Lax.
- Originali: Google Drive personale 100 GB, cartella riservata. Unicamente gli organizzatori collegano Google via OAuth; gli invitati non devono possedere un account Google.
- Rendizioni video low-res: Wistia candidato, da verificare sul piano gratuito e nella privacy.
- Foto leggere e audio nel feed: soluzione da implementare, preferibilmente backend autenticato e cache, senza file BLOB in D1.
- Push: Web Push VAPID, con consenso; su iPhone l'app deve essere aggiunta alla schermata Home.

## Media pipeline obiettivo
1. Invitato autenticato cattura media dalla fotocamera/microfono interno.
2. Validazione: tipo, dimensioni, massimo 60 secondi per video, anche lato server.
3. Backend crea il post pending e autorizza separatamente destinazioni di upload.
4. Originale acquisito viene inviato a Google Drive con caricamento ripristinabile, archiviato in cartella privata.
5. Per un video, si invia la copia destinata allo streaming a Wistia con token temporaneo e si attende encoding ready.
6. Per una foto/audio, si crea la versione leggera e la sua distribuzione autenticata.
7. Solo dopo conferma degli archivi, lo stato diventa published e il feed mostra il media.
8. Il record D1 contiene ID post, ID utente, tipo, commento, stato, drive_file_id, wistia_hashed_id e URL autorizzati. Non contiene i byte di un video.

## Attenzione alle parole originale / low-res
Originale = file acquisito dall'app prima di ogni trasformazione per il feed. Non garantisce 4K nativo da app Fotocamera del sistema. Prototipo corrente: richiesta camera idealmente 720p e bitrate video approssimativo di 1,2 Mbps; impostazioni di qualità da ridefinire dopo prove #2. Wistia genera qualità di streaming più basse, conservando Drive l'acquisizione originale dell'app.

## Autenticazione
Codici casuali in QR, un solo riscatto; in D1 solo hash con pepper segreto. QR link con fragment #invite=CODICE per non inviare il token iniziale al server dei file statici. Dopo il riscatto il frontend rimuove il fragment dalla barra. Sessione via cookie HttpOnly e tabella D1. Ruoli guest/organizer/helper. Da completare: rate limiting, revoca e rigenerazione QR.

## Privacy
La protezione embed Wistia tramite dominio/referrer NON è una ACL per ogni singolo invitato; un link estratto potrebbe essere riutilizzabile. È obbligatorio un test con account Free e una decisione esplicita sulla privacy. In assenza di protezione sufficiente, scegliere una distribuzione video autenticata prima di pubblicare contenuti reali. Google Drive deve rimanere privato. Il servizio non può garantire che qualcuno non effettui screenshot.

## Perché non P2P obbligatorio
WebRTC può ridurre traffico quando due telefoni sono online, ma i browser sospendono connessioni in background; nessun ricordo deve sparire se l'autore blocca il telefono. P2P solo eventuale accelerazione futura.

## Fonti tecniche ufficiali
- https://docs.wistia.com/docs/uploader
- https://docs.wistia.com/docs/using-wistias-domain-restrictions-with-a-referrer-policy
- https://developers.google.com/workspace/drive/api/guides/manage-uploads
- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.cloudflare.com/d1/
- https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
