# Test necessari prima di usare l'app al matrimonio

## Smartphone
iPhone Safari e PWA installata, Android Chrome e PWA installata. Provare accesso QR, fotocamera, cambio camera, foto, video con audio fino a 60 secondi, messaggi vocali, permessi negati, blocco schermo e riapertura.

## Autenticazione
QR monouso non riutilizzabile, sessione che resta attiva sul dispositivo, logout che invalida cookie, permessi guest vs helper/organizer, tentativi massivi di codici, revoca e recupero account.

## Upload e privacy
Con due telefoni: invio foto/video/audio A -> originale Drive + low-res del feed -> visibile a B solo autenticato. Rete instabile e retry senza duplicazione, 61 secondi falsificati rifiutati lato server. Drive mai pubblico. URL Wistia aperti fuori dal sito: documentare la risposta effettiva.

## Notifiche
Invio da sposi e collaboratrice, guest rifiutato. Su iPhone provare la PWA installata e permessi opt-in; utenti senza permesso vedono almeno il feed avvisi.

## Carico/quote
Simulare 200 sessioni attive, picco caricamenti e almeno 20-50 player contemporanei. Misurare percentuale errori, tempi di risposta, consumo banda Wistia, consumo risorse Workers e rate limit Google Drive. Verificare che non si attivino costi involontari.

## Go-live
Approvazione privacy, quota, funzionalità, esperienza su telefoni reali. Solo dopo una checklist completata il sistema si può dichiarare pronto.
