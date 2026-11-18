# Sicurezza, privacy, rischio

Il repo è PUBBLICO: nessun token, nominativo, codice QR, password, CSV inviti o media reale nei commit.

- QR è credenziale monouso, può essere rubato prima del primo riscatto: distribuire privatamente, creare procedura revoca/rigenerazione.
- Hash con pepper segreto per codice di invito; aggiungere rate limiting e monitor tentativi (#1).
- API private richiedono sessione cookie HttpOnly Secure SameSite=Lax; endpoint GET privati non devono essere cachati in CDN.
- Guest non può pubblicare avvisi né accedere a dati admin. Testare permessi per ogni endpoint nuovo.
- Con Wistia domain restriction non equivale a ACL per invitato. Provare URL estratti e incorporamento fuori sito, decidere livello privacy richiesto prima del lancio.
- Google Drive conserva originali privati, senza accesso pubblico alla cartella. OAuth refresh token solo backend.
- Il limite 60 secondi dei video è aggirabile da un client modificato; validarlo lato server.
- Media upload non deve utilizzare proxy generici di URL arbitrari (SSRF/open proxy). Usare ID e permission checks.
- Conservazione, diritto di rimozione, gestione minori, informativa GDPR e consenso per push vanno progettati prima dell'evento.
- Con rete lenta evitare falsi messaggi "upload completato"; serve conferma del Drive e della versione distribuita.
- Servizi gratuiti sono soggetti a quote e potenziali interruzioni: stress test e fallback operativi.
