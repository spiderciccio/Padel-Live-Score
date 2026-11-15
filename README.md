# Padel Live Score

Segnapunti per il padel da usare in campo: segni i punti toccando lo schermo oppure **dai tasti musica dello smartwatch** (pensato per la Honor Band 5), senza tirare fuori il telefono.

È una PWA: si installa sul telefono come un'app, funziona offline e non ha dipendenze né build.

## Funzionalità

- **Punteggio padel completo**: 15-30-40, game, set (a 6 con 2 di scarto) e tie-break a 7 sul 6-6.
- **Punto d'oro o vantaggi**: si sceglie con il pulsante in alto. In modalità punto d'oro, sul 40-40 il punteggio si colora per ricordare che il punto successivo decide il game.
- **Controllo dallo smartwatch** tramite i comandi multimediali:

  | Tasto sul watch | Azione |
  |---|---|
  | Traccia successiva ⏭ | Punto NOI |
  | Traccia precedente ⏮ | Punto LORO |
  | Play / Pausa ⏯ | Annulla l'ultimo punto |

  Il punteggio compare sul watch al posto del titolo del brano.
- **Suoni diversi** per punto NOI, punto LORO, game vinto e annulla, così sai cosa è stato segnato senza guardare. Si disattivano con 🔊/🔇.
- **Annulla** fino a 50 azioni, reset compreso.
- **Partita salvata** sul telefono: sopravvive a ricaricamenti e alla chiusura dell'app.
- **Offline**: dopo la prima apertura funziona anche senza rete.

## Come si usa

1. Apri l'app con **Chrome su Android** e installala (menu ⋮ → *Installa app*).
2. Premi **Attiva Band** prima di iniziare. Serve un tocco sullo schermo perché il browser permetta l'audio.
3. Sulla tendina di Android compare il player "NOI 0 - 0 LORO": da quel momento i tasti musica del watch controllano il punteggio.

### Come funziona il controllo dal watch

Le smartband non possono parlare con una pagina web, ma sanno comandare il player musicale del telefono. L'app riproduce in loop un audio muto di 30 secondi e usa la [Media Session API](https://developer.mozilla.org/docs/Web/API/Media_Session_API) per ricevere i comandi traccia successiva/precedente/pausa e per mostrare il punteggio come titolo del brano.

L'audio deve durare almeno 5 secondi: sotto questa soglia Chrome per Android non crea il player di sistema e il watch non vede nulla.

### Se il watch non risponde

- Controlla che sulla tendina di Android ci sia il player "NOI … LORO". Se non c'è, premi di nuovo **Attiva Band**.
- Nell'app del watch (per la Honor Band 5: Huawei Health) abilita il controllo della musica e concedi all'app l'**accesso alle notifiche** di Android.
- Usa Chrome: altri browser gestiscono la Media Session in modo meno affidabile.

## Pubblicazione

Il service worker richiede HTTPS (oppure `localhost`), quindi l'app va servita da un hosting statico. Con **GitHub Pages**:

1. Carica i file nel repository.
2. *Settings → Pages → Build and deployment*: sorgente **Deploy from a branch**, branch `main`, cartella `/ (root)`.
3. L'app sarà su `https://<utente>.github.io/<repository>/`.

Tutti i percorsi sono relativi, quindi funziona anche in una sottocartella.

### Sviluppo in locale

```sh
python3 -m http.server 8000
```

e apri <http://localhost:8000>.

Il service worker risponde dalla cache e aggiorna in background: dopo una modifica ricarica due volte, oppure in DevTools attiva *Application → Service workers → Update on reload*.

Quando pubblichi una nuova versione, cambia `CACHE_VERSION` in [`sw.js`](sw.js) così i telefoni scartano la cache vecchia.

## Struttura

| File | Contenuto |
|---|---|
| `index.html` | Interfaccia |
| `style.css` | Stili |
| `app.js` | Logica del punteggio, suoni, salvataggio, integrazione con il watch |
| `sw.js` | Service worker per l'uso offline |
| `manifest.webmanifest` | Manifest della PWA |
| `icons/` | Icone dell'app |

## Licenza

Distribuito con licenza [MIT](LICENSE).
