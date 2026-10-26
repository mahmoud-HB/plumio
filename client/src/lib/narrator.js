// Lecture à voix haute gratuite via la synthèse vocale du navigateur (Web Speech API).
// Le texte est découpé en phrases : certains navigateurs coupent les longues énonciations.

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

const SOFT_NAMES = /am[ée]lie|audrey|aur[ée]lie|marie|julie|denise|eloise|vivienne|hortense|l[ée]a|google fran[cç]ais/i;
const NEURAL = /natural|neural|premium|enhanced|online|siri/i;
const NOVELTY = /compact|albert|bad news|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|grandpa|rocko|eddy|reed/i;

function voiceScore(v) {
  let sc = 0;
  if (/^fr[-_]FR$/i.test(v.lang)) sc += 50;
  else if (/^fr/i.test(v.lang)) sc += 15;
  if (NEURAL.test(v.name)) sc += 40;
  if (SOFT_NAMES.test(v.name)) sc += 20;
  if (NOVELTY.test(v.name)) sc -= 60;
  if (!v.localService) sc += 5;
  return sc;
}

/** Voix françaises triées de la plus douce et naturelle à la moins bonne (France d'abord). */
export function frenchVoices() {
  return window.speechSynthesis.getVoices().filter((v) => /^fr/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a));
}

/** Découpe l'histoire en segments { page, text } ; page = -1 pour la couverture. */
export function buildSegments(story) {
  const split = (t) => t.match(/[^.!?…]+[.!?…]+["»”)]*\s*|[^.!?…]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [t];
  const segs = [{ page: -1, text: [story.title, story.subtitle].filter(Boolean).join('. ') }];
  story.pages.forEach((p, i) => {
    segs.push({ page: i, text: p.title });
    split(p.text).forEach((text) => segs.push({ page: i, text }));
  });
  return segs;
}

/** Contrôleur de lecture : play/pause/stop, vitesse et voix modifiables, rappel à chaque segment. */
export function createNarrator(segments, { onSegment, onState }) {
  const synth = window.speechSynthesis;
  let index = 0;
  let token = 0;
  let state = 'idle'; // idle | playing | paused
  const opts = { rate: 0.85, voiceURI: '' };
  let timer = null;

  const setState = (s) => { state = s; onState?.(s); };

  function speakCurrent() {
    const my = ++token;
    clearTimeout(timer);
    synth.cancel();
    if (index >= segments.length) { index = 0; setState('idle'); return; }
    const seg = segments[index];
    onSegment?.(index, seg);
    const u = new SpeechSynthesisUtterance(seg.text);
    u.lang = 'fr-FR';
    u.rate = opts.rate;
    u.pitch = 1;
    const voice = synth.getVoices().find((v) => v.voiceURI === opts.voiceURI) ?? frenchVoices()[0];
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    u.onend = () => {
      if (my !== token || state !== 'playing') return;
      // Pauses de conteur : courte entre deux phrases, plus longue entre deux pages
      const next = segments[index + 1];
      const gap = !next ? 0 : seg.page !== next.page ? 1500 : /^[^.!?…]*$/.test(seg.text) ? 800 : 500;
      index += 1;
      timer = setTimeout(() => { if (my === token && state === 'playing') speakCurrent(); }, gap / (opts.rate < 0.9 ? 1 : 1.5));
    };
    u.onerror = (e) => {
      if (my !== token || e.error === 'canceled' || e.error === 'interrupted') return;
      setState('idle');
    };
    synth.speak(u);
  }

  return {
    play(from = index) { index = from; setState('playing'); speakCurrent(); },
    pause() { if (state !== 'playing') return; token += 1; clearTimeout(timer); synth.cancel(); setState('paused'); },
    resume() { if (state === 'paused') { setState('playing'); speakCurrent(); } },
    stop() { token += 1; clearTimeout(timer); synth.cancel(); index = 0; setState('idle'); },
    /** Reprend au début d'une page (-1 = couverture). */
    seekPage(page) {
      const i = segments.findIndex((s) => s.page === page);
      if (i < 0) return;
      index = i;
      if (state === 'playing') speakCurrent();
    },
    set(o) {
      Object.assign(opts, o);
      if (state === 'playing') speakCurrent();
    },
    get state() { return state; },
    get progress() { return segments.length ? index / segments.length : 0; }
  };
}
