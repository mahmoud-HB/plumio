import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChunks, checkRateLimit, cleanForSpeech, normalizeStory, synthesizeStory, TtsError } from '../src/audio/tts.js';

const story = (over = {}) => ({
  title: 'Léa & le dragon',
  subtitle: 'Une « aventure »',
  pages: Array.from({ length: 10 }, (_, i) => ({ title: `Page ${i + 1}`, text: `Léa avance — pat-pat-pat. C’est l’étape ${i + 1} ! Elle sourit… puis repart.` })),
  ...over
});

test('cleanForSpeech nettoie guillemets, tirets et onomatopées', () => {
  assert.equal(cleanForSpeech('« Salut » — dit M. Leroi & Léa'), 'Salut, dit Monsieur Leroi et Léa');
  assert.match(cleanForSpeech('pat-pat-pat'), /pat, pat, pat/);
});

test('buildChunks : 1 couverture + 1 SSML par page, XML échappé, taille bornée', () => {
  const chunks = buildChunks(normalizeStory(story()));
  assert.equal(chunks.length, 11);
  assert.ok(chunks[0].includes('Léa et le dragon'));
  const long = story({ pages: [{ title: '', text: 'Une phrase assez longue pour remplir. '.repeat(45) }] });
  for (const c of buildChunks(normalizeStory(long))) assert.ok(Buffer.byteLength(c) <= 4500);
});

test('normalizeStory rejette les histoires invalides ou trop longues', () => {
  assert.throws(() => normalizeStory(null), TtsError);
  assert.throws(() => normalizeStory(story({ pages: [] })), TtsError);
  assert.throws(() => normalizeStory(story({ pages: [{ title: '', text: 'x'.repeat(5000) }] })), TtsError);
});

test('synthesizeStory : 503 sans clé, concatène et met en cache avec une clé', async () => {
  delete process.env.GOOGLE_TTS_API_KEY;
  await assert.rejects(() => synthesizeStory(story()), (e) => e.status === 503);

  process.env.GOOGLE_TTS_API_KEY = 'test';
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    return { ok: true, json: async () => ({ audioContent: Buffer.from('abc').toString('base64') }) };
  };
  const a = await synthesizeStory(story(), { fetchImpl });
  assert.equal(a.audio.length, 3 * 11);
  const before = calls;
  const b = await synthesizeStory(story(), { fetchImpl });
  assert.equal(b.cached, true);
  assert.equal(calls, before);

  const failing = async () => ({ ok: false, status: 403, json: async () => ({}) });
  await assert.rejects(() => synthesizeStory(story({ title: 'Autre' }), { fetchImpl: failing }), (e) => e.status === 502);
  delete process.env.GOOGLE_TTS_API_KEY;
});

test('checkRateLimit plafonne par IP', () => {
  const now = Date.now();
  for (let i = 0; i < 8; i++) assert.ok(checkRateLimit('1.2.3.4', now));
  assert.equal(checkRateLimit('1.2.3.4', now), false);
});
