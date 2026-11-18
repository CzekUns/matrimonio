# HANDOFF GENERALE — Matrimonio

Data: 18 novembre 2026
Repository: https://github.com/CzekUns/matrimonio

## Il prodotto richiesto
Social privato per ~200 invitati. I profili vengono creati dagli organizzatori: il singolo QR/codice dà accesso rapido senza registrazione Google. Feed con post recenti. Gli invitati possono soltanto scattare foto, registrare video fino a 60 secondi e messaggi vocali direttamente dall'app; NON importare foto/video preesistenti. Anteprima, possibilità di rifare e pubblicare.

Sposi e una collaboratrice possono inviare avvisi, successivamente notifiche push opt-in. Originali conservati nel Google Drive personale degli organizzatori (100 GB già pagati). Video ottimizzati su Wistia se supera i test di API, quote gratuite e privacy; D1 per i metadati, non per i file.

## Stato del codice
IMPLEMENTATO: interfaccia responsive e navigazione, demo esplicitamente locale, accesso demo, feed demo, avvisi demo; fotocamera in browser via getUserMedia, acquisizione JPEG, MediaRecorder video/audio, timer automatico di 60 secondi e anteprima. Manifest PWA e service worker per file statici.
PREPARATO MA NON DEPLOYATO: Cloudflare Worker con lettura feed/avvisi, codici monouso, sessioni HttpOnly e ruoli organizer/helper, D1 schema, generatore locale inviti.
NON ATTIVO: Drive, Wistia, media upload persistenti, push, QR reali e test 200 sessioni. Le immagini/video della demo non sopravvivono alla ricarica: è voluto e indicato nella UI.

## File principali
- public/index.html e public/styles.css: interfaccia
- public/app.js: navigazione, demo, fotocamera, preview
- worker/src/index.js: autenticazione e API Cloudflare
- worker/schema.sql: database
- scripts/generate-guests.mjs: CSV riservato codici + SQL
- wrangler.jsonc: configurazione Cloudflare da completare
- vercel.json: hosting statico demo su Vercel
- docs/SETUP.md: procedura collegamenti
- docs/STATUS.md: checkpoint reale
- docs/ARCHITECTURE.md: scelte e privacy
- docs/BACKLOG.md: ordine di lavoro
- docs/SECURITY.md e docs/TESTPLAN.md: controlli

## Issue operative
- https://github.com/CzekUns/matrimonio/issues/1 — QR, login e 200 account
- https://github.com/CzekUns/matrimonio/issues/2 — camera, audio e video iOS/Android
- https://github.com/CzekUns/matrimonio/issues/3 — Drive originali
- https://github.com/CzekUns/matrimonio/issues/4 — Wistia streaming e privacy
- https://github.com/CzekUns/matrimonio/issues/5 — pipeline foto/audio/video e feed
- https://github.com/CzekUns/matrimonio/issues/6 — push e permessi
- https://github.com/CzekUns/matrimonio/issues/7 — deploy e collaudo

## Priorità
Prima #1, test di #2, verifica Wistia #4, configurazione iniziale #7. Poi #3 e #5; infine #6 e QA finale #7. Non pubblicare clip reali prima che privacy/accessi siano validati.

## PROMPT PER UNA NUOVA CHAT
Sei l'agente esecutivo della issue #N di CzekUns/matrimonio. Leggi AGENTS.md, docs/HANDOFF.md, docs/STATUS.md, docs/ARCHITECTURE.md e tutta la issue #N. Implementa codice realmente salvato sulla repo, testa, aggiorna STATUS e riporta commit o PR, test effettuati, limiti e prossime dipendenze. Non segnare fatto quello che è ancora demo. Non esportare credenziali o dati personali.
