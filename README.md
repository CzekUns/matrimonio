# Matrimonio · Social privato PWA

Progetto per un social privato del matrimonio, fino a **200 invitati**, accesso con QR/codice, feed cronologico, fotocamera interna, video limitati a 60 secondi, messaggi vocali e comunicazioni degli organizzatori.

**Stato:** avvio del progetto (18 novembre 2026). La repo ospita un prototipo grafico e una base applicativa in sviluppo. **Non è ancora un servizio pronto per i 200 invitati.**

## Decisioni di prodotto

- Inviti e account pre-creati: nessuna registrazione per gli ospiti.
- Solo foto/video acquisiti dall'app, niente selettore di galleria; i video durano al massimo 60 secondi.
- Google Drive dell'organizzatore, piano 100 GB già esistente, come archivio degli originali.
- Wistia come **candidato** per il video ottimizzato; privacy, quote e API da validare con account reale.
- Cloudflare D1 per dati strutturati; nessun blob di foto/video in D1.
- PWA mobile-first, notifiche push con consensi e privilegi per sposi/damigella.
- Nessun costo aggiuntivo **come obiettivo**, subordinato ai limiti dei servizi gratuiti.

## Documentazione per altre chat e agenti

Aprire **[docs/HANDOFF.md](docs/HANDOFF.md)**, poi **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**, **[docs/SETUP.md](docs/SETUP.md)** e **[docs/BACKLOG.md](docs/BACKLOG.md)**. Le issue GitHub contengono gli incarichi esecutivi.

> Non inserire in GitHub token di Google, Wistia, codici QR personali o fotografie reali. I repository pubblici non devono contenere dati degli invitati.
