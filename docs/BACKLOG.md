# Backlog tecnico e ripartizione tra agenti

Tutte le issue sono su https://github.com/CzekUns/matrimonio/issues

## P0 — rendere la base verificabile
- #1 QR e 200 account: generazione privata, D1 online, rate limiting, revoca.
- #2 fotocamera: verifica iOS/Android, video max 60s validato dal server.
- #7 prima parte: deploy HTTPS di base e test di autenticazione.
- #4 verifica Wistia con account reale: limiti, espiring tokens, protezione link.

## P1 — media persistenti
- #3 OAuth proprietario e Drive per originali, upload ripristinabile.
- #5 pipeline media e feed: foto/video/audio accessibili su un secondo telefono dopo upload; moderazione e privacy; niente BLOB D1.
- #4 finire Wistia streaming e reconciliations ready/failed.

## P2 — comunicazione e lancio
- #6 Web Push VAPID, iscrizione, gestione consensi, prove iPhone/Android.
- #7 200 sessioni simulate, quote Free, backup, GDPR e approvazione grafica.

## Dipendenze
Non pubblicare media reali prima del collegamento di Drive e di una destinazione feed effettivamente autorizzata. Non dichiarare "sicuri per 200 invitati" i video Wistia fino a verifica privacy dell'URL. Non dire "zero costi certi" senza provare le quote. I video in app non hanno alcuna garanzia di sopravvivere alla ricarica finché non viene completato #5.

## Report ogni ciclo
Ogni chat/agent aggiorna docs/STATUS.md, issue assegnata e commit/PR. Specificare test veri, file toccati, ambiente e prossima dipendenza. Non dare per integrato ciò che è soltanto scritto nelle istruzioni.
