# Checkpoint di progetto

Data baseline: 18 novembre 2026. Repo: CzekUns/matrimonio. Branch principale: main.

| Funzione | Stato reale |
|---|---|
| Landing/PWA visuale basic | Codice implementato, deploy pubblico non verificato |
| Demo UI feed, navigazione, avvisi | Implementati, dati solo in memoria |
| Acquisizione foto, video <=60s, audio | Codice browser scritto; nessuna prova su smartphone reale |
| Anteprima / pubblicazione | Anteprima reale; pubblicazione SOLO nella demo locale |
| Manifest + cache shell | Codice implementato, test installabilità da fare |
| API Cloudflare D1 | Codice scritto, non configurato su account Cloudflare |
| Codici monouso + sessioni HttpOnly | Codice predisposto, non testato in produzione |
| Generatore locale inviti | Script scritto; dati reali non generati |
| Feed persistente media | NON implementato; endpoint read-only |
| Google Drive originali | NON collegato |
| Wistia streaming video | NON collegato, privacy da valutare |
| Immagini e audio leggeri sul feed | NON implementati |
| Avvisi organizer/helper | API scritta, push NON implementata |
| Notifiche push | NON implementate |
| Simulazione 200 invitati | NON eseguita |

## Prossima azione
Verificare sintassi/build JS e deploy HTTPS della demo; iniziare issue #1 e #4. Il sistema non è pronto per un evento reale.

## Come aggiungere checkpoint
Per ogni modifica lasciare data, SHA/PR, elenco file, test eseguiti davvero, risultato, dubbi e dipendenza successiva. Vietato convertire un mock o un codice non eseguito in un risultato dichiarato completato.
