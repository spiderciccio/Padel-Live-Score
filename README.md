# Padel Live Score

🇬🇧 [English version below](#english)

Segnapunti per il padel da usare in campo. Segni i punti toccando lo schermo oppure **con i tasti musica di un dispositivo Bluetooth** (smartwatch, smartband, cuffie, telecomando), senza tirare fuori il telefono.

È una PWA: si installa sul telefono come un'app, funziona anche senza rete e non ha dipendenze né build.

## Funzionalità

- **Punteggio padel completo**: 15-30-40, game, set (a 6 con 2 di scarto) e tie-break a 7 sul 6-6.
- **Punto d'oro o vantaggi**: si sceglie con il pulsante in alto. Con il punto d'oro, sul 40-40 il punteggio si colora per ricordarti che il prossimo punto decide il game.
- **Controllo da dispositivi Bluetooth** con i tasti musica:

  | Tasto | Azione |
  |---|---|
  | Traccia successiva ⏭ | Punto Team A |
  | Traccia precedente ⏮ | Punto Team B |
  | Play / Pausa ⏯ | Annulla l'ultimo punto |

  Sui dispositivi con schermo (es. smartwatch) il punteggio compare al posto del titolo del brano.
- **Suoni diversi** per punto Team A, punto Team B, game vinto e annulla: capisci cosa è stato segnato senza guardare. Si spengono con 🔊/🔇.
- **Annulla** fino a 50 azioni, reset compreso.
- **Partita salvata** sul telefono: resta anche se ricarichi o chiudi l'app.
- **Funziona offline** dopo la prima apertura.
- **Aggiornamenti con un tocco**: quando esce una nuova versione compare un banner giallo *"Nuova versione disponibile"*. Premi **Aggiorna** e l'app si ricarica senza perdere la partita.
- **Versione visibile** in piccolo in fondo alla pagina.

## Come si usa

1. Apri l'app con **Chrome su Android** e installala (menu ⋮ → *Installa app*).
2. Premi **🎧 Attiva controllo** prima di iniziare. Serve un tocco sullo schermo perché il browser permetta l'audio.
3. Nella tendina di Android compare il player "Team A 0 - 0 Team B": da quel momento i tasti musica del dispositivo Bluetooth controllano il punteggio.

### Come funziona il controllo Bluetooth

Smartwatch, cuffie e telecomandi Bluetooth non possono parlare con una pagina web, ma sanno comandare il player musicale del telefono. L'app quindi riproduce in loop un audio muto di 30 secondi e usa la [Media Session API](https://developer.mozilla.org/docs/Web/API/Media_Session_API) per:

- ricevere i comandi traccia successiva / precedente / pausa;
- mostrare il punteggio come titolo del brano.

L'audio deve durare almeno 5 secondi: sotto questa soglia Chrome per Android non mostra il player e il dispositivo non vede nulla.

### Se il dispositivo non risponde

- Controlla che nella tendina di Android ci sia il player "Team A … Team B". Se non c'è, premi di nuovo **🎧 Attiva controllo**.
- Verifica che il dispositivo sia collegato al telefono via Bluetooth.
- Per smartwatch e smartband: nell'app di gestione (es. Huawei Health, Zepp, Galaxy Wearable) abilita il controllo della musica e dai all'app l'**accesso alle notifiche** di Android.
- Usa Chrome: con altri browser funziona peggio.

## Pubblicazione

L'app deve essere servita in HTTPS (oppure da `localhost`). Con **GitHub Pages**:

1. Carica i file nel repository.
2. *Settings → Pages → Build and deployment*: sorgente **Deploy from a branch**, branch `main`, cartella `/ (root)`.
3. L'app sarà su `https://<utente>.github.io/<repository>/`.

I percorsi sono tutti relativi, quindi funziona anche in una sottocartella.

### Rilasciare una nuova versione

Ad ogni rilascio cambia `CACHE_VERSION` in [`sw.js`](sw.js), usando la data di oggi:

```js
const CACHE_VERSION = 'padel-score-AAAA-MM-GG';
```

È questo cambio che fa partire l'aggiornamento:

1. il telefono si accorge che `sw.js` è cambiato e scarica la nuova versione in background;
2. nell'app compare il banner **Aggiorna**;
3. l'utente lo preme, l'app si ricarica con i file nuovi e in fondo alla pagina si vede la nuova versione.

Se non cambi `CACHE_VERSION`, le modifiche arrivano lo stesso, ma senza banner e solo dopo due aperture dell'app.

### Sviluppo in locale

```sh
python3 -m http.server 8000
```

e apri <http://localhost:8000>.

L'app risponde dalla cache e si aggiorna in background, quindi dopo una modifica ricarica due volte. In alternativa, in DevTools attiva *Application → Service workers → Update on reload*.

## Struttura

| File | Contenuto |
|---|---|
| `index.html` | Interfaccia |
| `style.css` | Stili |
| `app.js` | Punteggio, suoni, salvataggio, controllo Bluetooth, banner di aggiornamento |
| `sw.js` | Service worker: uso offline e versione dell'app |
| `manifest.webmanifest` | Manifest della PWA |
| `icons/` | Icone dell'app |

## Supporta il progetto

Se l'app ti è utile, puoi supportarne lo sviluppo con una donazione su [GitHub Sponsors](https://github.com/sponsors/spiderciccio). ♥

## Licenza

Copyright (c) 2026 Francesco Cristaldi.

Distribuito con licenza [GNU AGPL v3](LICENSE). Chi modifica l'app e la distribuisce, o la rende disponibile online, deve pubblicare il codice sorgente con la stessa licenza.

Per usarla senza questi obblighi, ad esempio in un prodotto commerciale a codice chiuso, è disponibile una licenza commerciale: scrivi a [spiderciccio@msn.com](mailto:spiderciccio@msn.com).

---

<a id="english"></a>

# English

A padel scoreboard to use on court. Score points by tapping the screen or **with the music buttons of a Bluetooth device** (smartwatch, smartband, headphones, remote), without taking out your phone.

It's a PWA: it installs on your phone like an app, works offline and has no dependencies or build step.

## Features

- **Full padel scoring**: 15-30-40, games, sets (first to 6, win by 2) and tie-break to 7 at 6-6.
- **Golden point or advantages**: pick one with the button at the top. With golden point, at 40-40 the score changes color to remind you the next point wins the game.
- **Bluetooth device control** with the music buttons:

  | Button | Action |
  |---|---|
  | Next track ⏭ | Point to Team A |
  | Previous track ⏮ | Point to Team B |
  | Play / Pause ⏯ | Undo last point |

  On devices with a screen (e.g. smartwatches) the score shows as the track title.
- **Different sounds** for each team's point, game won and undo, so you know what was scored without looking. Toggle with 🔊/🔇.
- **Undo** up to 50 actions, including reset.
- **Match saved** on the phone: it survives reloads and closing the app.
- **Works offline** after the first visit.
- **One-tap updates**: when a new version is out, a yellow *"Nuova versione disponibile"* (new version available) banner appears. Tap **Aggiorna** (update) and the app reloads without losing the match.
- **Version shown** in small text at the bottom of the page.

## How to use

1. Open the app in **Chrome on Android** and install it (menu ⋮ → *Install app*).
2. Tap **🎧 Attiva controllo** (enable control) before starting. The browser only allows audio after a tap on the screen.
3. An Android media player "Team A 0 - 0 Team B" appears in the notification shade: from now on the Bluetooth device's music buttons control the score.

### How Bluetooth control works

Smartwatches, headphones and Bluetooth remotes can't talk to a web page, but they can control the phone's music player. So the app plays a silent 30-second audio in a loop and uses the [Media Session API](https://developer.mozilla.org/docs/Web/API/Media_Session_API) to:

- receive next / previous / pause commands;
- show the score as the track title.

The audio must be at least 5 seconds long: below that, Chrome for Android doesn't show the player and the device sees nothing.

### If the device doesn't respond

- Check that the "Team A … Team B" player is in the Android notification shade. If it isn't, tap **🎧 Attiva controllo** again.
- Make sure the device is connected to the phone via Bluetooth.
- For smartwatches and smartbands: in the companion app (e.g. Huawei Health, Zepp, Galaxy Wearable) enable music control and grant the app Android **notification access**.
- Use Chrome: other browsers work less reliably.

## Deployment

The app must be served over HTTPS (or from `localhost`). With **GitHub Pages**:

1. Push the files to the repository.
2. *Settings → Pages → Build and deployment*: source **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The app will be at `https://<user>.github.io/<repository>/`.

All paths are relative, so it also works in a subfolder.

### Releasing a new version

On every release change `CACHE_VERSION` in [`sw.js`](sw.js) to today's date:

```js
const CACHE_VERSION = 'padel-score-YYYY-MM-DD';
```

This change is what triggers the update:

1. the phone notices `sw.js` has changed and downloads the new version in the background;
2. the **Aggiorna** banner appears in the app;
3. the user taps it, the app reloads with the new files and the new version shows at the bottom of the page.

If you don't change `CACHE_VERSION`, changes still arrive, but with no banner and only after opening the app twice.

### Local development

```sh
python3 -m http.server 8000
```

and open <http://localhost:8000>.

The app serves files from the cache and updates in the background, so after a change reload twice. Alternatively, in DevTools enable *Application → Service workers → Update on reload*.

## Structure

| File | Contents |
|---|---|
| `index.html` | User interface |
| `style.css` | Styles |
| `app.js` | Scoring, sounds, saving, Bluetooth control, update banner |
| `sw.js` | Service worker: offline use and app version |
| `manifest.webmanifest` | PWA manifest |
| `icons/` | App icons |

## Support the project

If you find the app useful, you can support its development with a donation on [GitHub Sponsors](https://github.com/sponsors/spiderciccio). ♥

## License

Copyright (c) 2026 Francesco Cristaldi.

Released under the [GNU AGPL v3](LICENSE) license. If you modify the app and distribute it, or make it available over a network, you must publish your source code under the same license.

A commercial license is available for use without these obligations (for example in a closed-source commercial product): write to [spiderciccio@msn.com](mailto:spiderciccio@msn.com).
