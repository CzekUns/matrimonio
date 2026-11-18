# Istruzioni per gli agenti che lavorano su Matrimonio

Leggere in ordine README.md, docs/HANDOFF.md, docs/STATUS.md, docs/ARCHITECTURE.md e la issue assegnata. Il repository GitHub è la fonte condivisa tra chat.

## Decisioni vincolanti
1. Social privato PWA per circa 200 ospiti, con account creati prima e QR/codice monouso; l'ospite non deve registrarsi.
2. Fotocamera/microfono interni; niente selezione di galleria. Video massimo 60 secondi, da verificare anche lato server.
3. Originali di foto, video e audio su Google Drive dell'organizzatore, abbonamento 100 GB già esistente.
4. Cloudflare D1 gestisce SOLO dati strutturati, non BLOB media.
5. Wistia è il candidato per video ottimizzati: privacy e API del Free richiedono collaudo, non è ancora definitivamente approvato.
6. Organizzatori e collaboratrice hanno il permesso di inviare avvisi, poi push con consenso degli ospiti.
7. Obiettivo: zero costi aggiuntivi. Non introdurre R2, Cloudinary o piani a pagamento senza decisione del proprietario.
8. Grafica per ora basic, mobile-first.

## Metodo di lavoro
- Leggere i file già presenti prima di modificarli.
- Lavorare su una issue specifica e lasciare commit/PR con codice, test e documenti aggiornati.
- Scrivere in docs/STATUS.md cosa è davvero testato, cosa è solo demo e quale integrazione manca.
- Non chiamare completata una funzione senza prova di caricamento persistente e test su dispositivo se necessari.
- Non pubblicare in GitHub token, codici QR, CSV nominativi, Google OAuth refresh token o foto/video reali.
- Un mock grafico non equivale ad applicazione pronta per il matrimonio.
