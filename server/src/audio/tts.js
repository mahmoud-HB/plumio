import crypto from 'node:crypto';

// Narration haute qualité via Google Cloud Text-to-Speech (voix Neural2).
// La clé n'existe que côté serveur (GOOGLE_TTS_API_KEY). Sans clé, le site garde la voix du navigateur.

const ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const MAX_SSML_BYTES = 4500; // limite Google : 5000 octets par requête
const MAX_RESPONSE_BYTES = 4_200_000; // Vercel refuse les réponses > 4,5 Mo
const MAX_PAGE_CHARS = 1800;
const MAX_TOTAL_CHARS = 16_000;
const PARALLEL = 4;

export const ttsConfigured = () => Boolean(process.env.GOOGLE_TTS_API_KEY?.trim());

export class TtsError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Mêmes règles que la lecture du navigateur : guillemets, tirets, onomatopées. */
export function cleanForSpeech(text) {
  return String(text)
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace(/[«»“”"]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\b([A-Za-zÀ-ÿ]{2,})(?:-\1)+\b/gi, (m) => m.split('-').join(', '))
    .replace(/&/g, ' et ')
    .replace(/\bM\.\s/g, 'Monsieur ')
    .replace(/…/g, '...')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Valide l'histoire reçue avant de dépenser du quota (le service est facturable au caractère). */
export function normalizeStory(story) {
  const pages = story?.pages;
  if (!story || typeof story.title !== 'string' || !Array.isArray(pages) || pages.length < 1 || pages.length > 12) {
    throw new TtsError('bad_story', 'Histoire invalide.', 400);
  }
  const out = {
    title: story.title.slice(0, 200),
    subtitle: typeof story.subtitle === 'string' ? story.subtitle.slice(0, 300) : '',
    pages: pages.map((p) => ({ title: typeof p?.title === 'string' ? p.title.slice(0, 120) : '', text: typeof p?.text === 'string' ? p.text : '' }))
  };
  let total = out.title.length + out.subtitle.length;
  for (const p of out.pages) {
    if (!p.text.trim() || p.text.length > MAX_PAGE_CHARS) throw new TtsError('bad_story', 'Histoire invalide.', 400);
    total += p.title.length + p.text.length;
  }
  if (total > MAX_TOTAL_CHARS) throw new TtsError('bad_story', 'Histoire trop longue.', 400);
  return out;
}

const sentences = (t) => t.match(/[^.!?…]+[.!?…]+["»”)]*\s*|[^.!?…]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [t];

/** Un SSML par page (≤ 4500 octets) : titre, pauses, phrases balisées <s> pour une prosodie naturelle. */
export function buildChunks(story) {
  const speak = (inner) => `<speak>${inner}</speak>`;
  const s = (t) => `<s>${escapeXml(cleanForSpeech(t))}</s>`;
  const chunks = [speak(s(story.title) + (story.subtitle ? `<break time="500ms"/>${s(story.subtitle)}` : ''))];
  for (const p of story.pages) {
    const head = `<break time="1000ms"/>${p.title ? `${s(p.title)}<break time="600ms"/>` : ''}`;
    let cur = head;
    for (const sent of sentences(p.text)) {
      const piece = s(sent);
      if (cur !== head && Buffer.byteLength(speak(cur + piece)) > MAX_SSML_BYTES) {
        chunks.push(speak(cur));
        cur = '';
      }
      cur += piece;
    }
    chunks.push(speak(cur));
  }
  return chunks;
}

async function synthesize(ssml, fetchImpl) {
  let res;
  try {
    res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GOOGLE_TTS_API_KEY.trim() },
      body: JSON.stringify({
        input: { ssml },
        voice: { languageCode: 'fr-FR', name: process.env.GOOGLE_TTS_VOICE || 'fr-FR-Neural2-A' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: Number(process.env.GOOGLE_TTS_RATE) || 0.9, pitch: Number(process.env.GOOGLE_TTS_PITCH) || -1 }
      }),
      signal: AbortSignal.timeout(60_000)
    });
  } catch {
    throw new TtsError('upstream_unreachable', 'Le service vocal est injoignable.', 502);
  }
  if (!res.ok) {
    console.error('[tts] Google', res.status);
    throw new TtsError(res.status === 429 || res.status === 403 ? 'quota' : 'upstream_error', 'Le service vocal est indisponible.', 502);
  }
  const data = await res.json().catch(() => null);
  if (!data?.audioContent) throw new TtsError('upstream_error', 'Le service vocal est indisponible.', 502);
  return Buffer.from(data.audioContent, 'base64');
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

// Cache mémoire par instance : une même histoire n'est synthétisée qu'une fois (préserve le quota gratuit).
const cache = new Map();
const CACHE_MAX = 12;

export async function synthesizeStory(rawStory, { fetchImpl = fetch } = {}) {
  if (!ttsConfigured()) throw new TtsError('not_configured', 'La voix haute qualité n’est pas activée.', 503);
  const story = normalizeStory(rawStory);
  const chunks = buildChunks(story);
  const key = crypto.createHash('sha256').update(chunks.join('\n') + (process.env.GOOGLE_TTS_VOICE || '')).digest('hex');
  if (cache.has(key)) {
    const hit = cache.get(key);
    cache.delete(key);
    cache.set(key, hit);
    return { audio: hit, cached: true, chars: 0 };
  }
  const parts = await mapLimit(chunks, PARALLEL, (c) => synthesize(c, fetchImpl));
  const audio = Buffer.concat(parts);
  if (audio.length > MAX_RESPONSE_BYTES) throw new TtsError('too_large', 'L’audio est trop long pour être envoyé d’un bloc.', 413);
  cache.set(key, audio);
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
  return { audio, cached: false, chars: chunks.reduce((n, c) => n + c.length, 0) };
}

// Garde-fous anti-abus (par instance) : quota par IP et plafond quotidien pour ne pas épuiser le quota gratuit.
const ipHits = new Map();
let day = { date: '', chars: 0 };
const IP_LIMIT = 8;
const IP_WINDOW_MS = 3_600_000;
const dailyCap = () => Number(process.env.TTS_DAILY_CHARS) || 40_000;

export function checkRateLimit(ip, now = Date.now()) {
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < IP_WINDOW_MS);
  if (recent.length >= IP_LIMIT) return false;
  recent.push(now);
  ipHits.set(ip, recent);
  if (ipHits.size > 5000) ipHits.clear();
  return true;
}

export function spendDailyChars(chars, now = new Date()) {
  const date = now.toISOString().slice(0, 10);
  if (day.date !== date) day = { date, chars: 0 };
  day.chars += chars;
}

export const dailyBudgetLeft = (now = new Date()) => (day.date === now.toISOString().slice(0, 10) ? day.chars : 0) < dailyCap();
