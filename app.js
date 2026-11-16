// --- STATO DEL MATCH ---
const DEFAULT_STATE = {
  pointsA: 0, // 0, 1 (15), 2 (30), 3 (40), 4 (AD)
  pointsB: 0,
  gamesA: 0,
  gamesB: 0,
  setsA: 0,
  setsB: 0,
  completedSets: [],
  isTieBreak: false,
  goldenPoint: true
};

let state = structuredClone(DEFAULT_STATE);
let historyStack = [];
let bandActive = false;
let audioEl = null;
let audioCtx = null;
let soundOn = true;
try { soundOn = localStorage.getItem('padel-sound') !== 'off'; } catch (e) {}

const POINT_LABELS = ['0', '15', '30', '40', 'AD'];

// --- ELEMENTI DOM ---
const dom = {
  btnMode: document.getElementById('btn-mode'),
  btnSound: document.getElementById('btn-sound'),
  btnReset: document.getElementById('btn-reset'),
  btnConnect: document.getElementById('btn-connect'),
  btnUndo: document.getElementById('btn-undo'),
  cardA: document.getElementById('card-a'),
  cardB: document.getElementById('card-b'),
  pointsA: document.getElementById('points-a'),
  pointsB: document.getElementById('points-b'),
  gamesA: document.getElementById('games-a'),
  gamesB: document.getElementById('games-b'),
  setsA: document.getElementById('sets-a'),
  setsB: document.getElementById('sets-b'),
  setHistory: document.getElementById('set-history'),
  bandBanner: document.getElementById('band-banner'),
  statusDot: document.getElementById('status-dot'),
  toast: document.getElementById('toast'),
  updateBanner: document.getElementById('update-banner'),
  btnUpdate: document.getElementById('btn-update'),
  appVersion: document.getElementById('app-version')
};

// --- EVENT LISTENERS ---
dom.btnMode.addEventListener('click', toggleGoldenPoint);
dom.btnSound.addEventListener('click', toggleSound);
dom.btnReset.addEventListener('click', resetMatch);
dom.btnConnect.addEventListener('click', enableBandControl);
dom.btnUndo.addEventListener('click', undoPoint);
dom.cardA.addEventListener('click', () => scorePoint('A'));
dom.cardB.addEventListener('click', () => scorePoint('B'));
dom.btnUpdate.addEventListener('click', applyUpdate);

// --- LOGICA PUNTEGGIO PADEL ---
function saveSnapshot() {
  historyStack.push(JSON.parse(JSON.stringify(state)));
  if (historyStack.length > 50) historyStack.shift();
  dom.btnUndo.disabled = false;
}

function undoPoint() {
  if (historyStack.length === 0) return;
  // La modalità (punto d'oro / vantaggi) è un'impostazione: l'annulla non deve cambiarla
  const { goldenPoint } = state;
  state = historyStack.pop();
  state.goldenPoint = goldenPoint;
  dom.btnUndo.disabled = historyStack.length === 0;
  render();
  playSound('undo');
  showToast('↩ Ultimo punto annullato');
}

function toggleGoldenPoint() {
  state.goldenPoint = !state.goldenPoint;
  render();
  showToast(state.goldenPoint ? '⭐ Punto de Oro' : '🎾 Vantaggi (AD)');
}

function scorePoint(team) {
  saveSnapshot();
  const isA = team === 'A';
  const gamesBefore = state.gamesA + state.gamesB + state.setsA + state.setsB;

  if (state.isTieBreak) {
    if (isA) state.pointsA++;
    else state.pointsB++;
    checkTieBreakWin();
  } else {
    handleStandardPoint(isA);
  }

  render();
  const gameWon = state.gamesA + state.gamesB + state.setsA + state.setsB !== gamesBefore;
  playSound(gameWon ? (isA ? 'gameA' : 'gameB') : (isA ? 'pointA' : 'pointB'));
  showToast(isA ? '🎾 Punto Team A' : '🎾 Punto Team B');
}

function handleStandardPoint(isA) {
  let pWin = isA ? state.pointsA : state.pointsB;
  let pLose = isA ? state.pointsB : state.pointsA;

  if (pWin < 3) {
    pWin++;
  } else if (pWin === 3) {
    if (pLose < 3) {
      winGame(isA);
      return;
    } else if (pLose === 3) {
      if (state.goldenPoint) {
        winGame(isA);
        return;
      } else {
        pWin = 4; // Vantaggio
      }
    } else if (pLose === 4) {
      // L'avversario aveva vantaggio -> torna 40-40
      pLose = 3;
    }
  } else if (pWin === 4) {
    winGame(isA);
    return;
  }

  if (isA) {
    state.pointsA = pWin;
    state.pointsB = pLose;
  } else {
    state.pointsB = pWin;
    state.pointsA = pLose;
  }
}

function checkTieBreakWin() {
  const { pointsA, pointsB } = state;
  if ((pointsA >= 7 || pointsB >= 7) && Math.abs(pointsA - pointsB) >= 2) {
    winGame(pointsA > pointsB);
  }
}

function winGame(isA) {
  state.pointsA = 0;
  state.pointsB = 0;
  state.isTieBreak = false;

  if (isA) state.gamesA++;
  else state.gamesB++;

  const { gamesA, gamesB } = state;
  if ((gamesA >= 6 || gamesB >= 6) && Math.abs(gamesA - gamesB) >= 2) {
    winSet(gamesA > gamesB);
  } else if (gamesA === 7 || gamesB === 7) {
    winSet(gamesA > gamesB);
  } else if (gamesA === 6 && gamesB === 6) {
    state.isTieBreak = true;
    showToast('🔥 TIE-BREAK!');
  }
}

function winSet(isA) {
  state.completedSets.push(`${state.gamesA}-${state.gamesB}`);
  if (isA) state.setsA++;
  else state.setsB++;
  state.gamesA = 0;
  state.gamesB = 0;
  showToast(isA ? '🏆 SET TEAM A!' : '🏆 SET TEAM B!');
}

function resetMatch() {
  if (!confirm('Azzerare tutta la partita?')) return;
  saveSnapshot();
  state.pointsA = 0;
  state.pointsB = 0;
  state.gamesA = 0;
  state.gamesB = 0;
  state.setsA = 0;
  state.setsB = 0;
  state.completedSets = [];
  state.isTieBreak = false;
  render();
}

// --- SALVATAGGIO PARTITA (localStorage) ---
// Il punteggio e la cronologia per l'annulla sopravvivono a ricaricamenti e
// alla chiusura dell'app da parte di Android.
const MATCH_KEY = 'padel-match';

function saveMatch() {
  try {
    localStorage.setItem(MATCH_KEY, JSON.stringify({ state, history: historyStack }));
  } catch (e) {}
}

function loadMatch() {
  try {
    const saved = JSON.parse(localStorage.getItem(MATCH_KEY));
    if (!saved || typeof saved.state !== 'object') return;
    state = { ...structuredClone(DEFAULT_STATE), ...saved.state };
    historyStack = Array.isArray(saved.history) ? saved.history : [];
  } catch (e) {}
  dom.btnUndo.disabled = historyStack.length === 0;
}

// --- RENDERING UI & BAND ---
function getFormattedPoints() {
  if (state.isTieBreak) {
    return { a: String(state.pointsA), b: String(state.pointsB), isGold: false };
  }
  const isDeuceGolden = state.goldenPoint && state.pointsA === 3 && state.pointsB === 3;
  return {
    a: POINT_LABELS[state.pointsA],
    b: POINT_LABELS[state.pointsB],
    isGold: isDeuceGolden
  };
}

function render() {
  const pts = getFormattedPoints();

  dom.btnSound.innerText = soundOn ? '🔊' : '🔇';
  dom.btnSound.setAttribute('aria-label', soundOn ? 'Suoni attivi' : 'Suoni disattivati');

  dom.btnMode.innerText = state.goldenPoint ? 'Punto de Oro' : 'Vantaggi (AD)';
  dom.btnMode.classList.toggle('gold', state.goldenPoint);

  dom.pointsA.innerText = pts.a;
  dom.pointsB.innerText = pts.b;

  dom.pointsA.classList.toggle('golden', pts.isGold);
  dom.pointsB.classList.toggle('golden', pts.isGold);

  dom.gamesA.innerText = state.gamesA;
  dom.gamesB.innerText = state.gamesB;
  dom.setsA.innerText = state.setsA;
  dom.setsB.innerText = state.setsB;

  if (state.completedSets.length === 0) {
    dom.setHistory.innerHTML = '<span>Set precedenti: -</span>';
  } else {
    dom.setHistory.innerHTML = state.completedSets
      .map((s, i) => `<span class="set-chip">S${i + 1}: ${s}</span>`)
      .join('');
  }

  updateBandMetadata(pts.a, pts.b);
  saveMatch();
}

function showToast(msg) {
  dom.toast.innerText = msg;
  dom.toast.classList.add('show');
  clearTimeout(dom.toast._timer);
  dom.toast._timer = setTimeout(() => dom.toast.classList.remove('show'), 1400);
}

// --- SUONI (Web Audio API, nessun file) ---
// Team A: due note che salgono (sine). Team B: due note che scendono (triangle).
// Game vinto: arpeggio di tre note. Annulla: nota bassa singola.
const SOUNDS = {
  pointA: { wave: 'sine', notes: [660, 880] },
  pointB: { wave: 'triangle', notes: [520, 390] },
  gameA: { wave: 'sine', notes: [660, 880, 1320] },
  gameB: { wave: 'triangle', notes: [520, 390, 260] },
  undo: { wave: 'square', notes: [200], gain: 0.08 }
};

function ensureAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(name) {
  if (!soundOn) return;
  const ctx = ensureAudioCtx();
  const sound = SOUNDS[name];
  if (!ctx || !sound) return;

  const noteLen = 0.11;
  const peak = sound.gain ?? 0.25;
  sound.notes.forEach((freq, i) => {
    const start = ctx.currentTime + i * noteLen;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = sound.wave;
    osc.frequency.value = freq;
    // inviluppo breve per evitare click
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + noteLen + 0.02);
  });
}

function toggleSound() {
  soundOn = !soundOn;
  try { localStorage.setItem('padel-sound', soundOn ? 'on' : 'off'); } catch (e) {}
  render();
  if (soundOn) playSound('pointA');
}

// --- CONTROLLO DA DISPOSITIVI BLUETOOTH (MEDIA SESSION API) ---
function createSilentWavBlobUrl() {
  // Chrome Android crea la sessione media (notifica + controlli Bluetooth/smartwatch)
  // solo per media di durata >= 5 secondi: usiamo 30s di silenzio.
  const sampleRate = 8000;
  const seconds = 30;
  const dataSize = sampleRate * seconds; // 8 bit mono => 1 byte per campione
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (off, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  // PCM 8 bit è unsigned: il silenzio è 128, non 0 (0 = offset massimo => "click")
  new Uint8Array(buffer, 44).fill(128);
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

async function enableBandControl() {
  try {
    if (!audioEl) {
      audioEl = new Audio(createSilentWavBlobUrl());
      audioEl.loop = true;
    }
    await audioEl.play();
    ensureAudioCtx(); // sblocca i suoni dentro il gesto dell'utente
    bandActive = true;

    dom.bandBanner.classList.add('connected');
    dom.statusDot.classList.add('active');

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('nexttrack', () => scorePoint('B'));
      navigator.mediaSession.setActionHandler('previoustrack', () => scorePoint('A'));

      const handlePlayPause = () => {
        undoPoint();
        if (audioEl.paused) audioEl.play();
        navigator.mediaSession.playbackState = 'playing';
      };
      navigator.mediaSession.setActionHandler('play', handlePlayPause);
      navigator.mediaSession.setActionHandler('pause', handlePlayPause);

      navigator.mediaSession.playbackState = 'playing';
      const pts = getFormattedPoints();
      updateBandMetadata(pts.a, pts.b);
    }

    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch(() => {});
    }

    showToast('🎧 Controllo media attivo!');
  } catch (err) {
    alert('Impossibile attivare la sessione media: ' + err.message);
  }
}

function updateBandMetadata(pA, pB) {
  if (!bandActive || !('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: `${pA}-${pB}`,
    artist: `Game: ${state.gamesA}-${state.gamesB} | Set: ${state.setsA}-${state.setsB} `,
    album: 'Padel Live Score'
  });
}

// --- PWA ---
// --- SERVICE WORKER + BANNER AGGIORNAMENTO ---
let waitingWorker = null;

function showUpdateBanner(worker) {
  waitingWorker = worker;
  dom.updateBanner.classList.add('show');
}

// Chiede al service worker attivo la sua CACHE_VERSION e la mostra nel footer
function showAppVersion(worker) {
  if (!worker) return;
  const channel = new MessageChannel();
  channel.port1.onmessage = (event) => { dom.appVersion.textContent = event.data; };
  worker.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
}

function applyUpdate() {
  if (!waitingWorker) return;
  dom.btnUpdate.disabled = true;
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
}

if ('serviceWorker' in navigator) {
  // Quando il nuovo SW prende il controllo ricarichiamo (una sola volta).
  // La partita è salvata in localStorage, quindi non si perde nulla.
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.ready.then((reg) => showAppVersion(reg.active));

    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
      // Un aggiornamento era già scaricato e in attesa (es. app riaperta)
      if (reg.waiting && navigator.serviceWorker.controller) showUpdateBanner(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          // "installed" con un controller attivo = nuova versione, non primo avvio
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(worker);
          }
        });
      });

      // Controlla aggiornamenti quando l'app torna in primo piano
      // (le PWA installate restano aperte a lungo senza ricaricare la pagina)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    }).catch(() => {});
  });
}

// Avvio iniziale
loadMatch();
render();