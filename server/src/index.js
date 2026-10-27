import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import { aiStory } from './story/ai.js';
import { localStory, storyCount } from './story/local.js';
import { validateStory } from './story/validate.js';
import { generateIllustrations } from './images.js';
import { buildBook } from './pdf/book.js';
import { detectImageType } from './pdf/layout.js';
import { themeKey } from './pdf/scenes.js';
import { buildGamesPdf, validateGameInput } from './games/render.js';
import { BANDS, GAMES, bandOf } from './games/catalog.js';
import { TtsError, checkRateLimit, dailyBudgetLeft, spendDailyChars, synthesizeStory, ttsConfigured } from './audio/tts.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // Vercel limite le corps de requête à 4,5 Mo
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_PHOTO_BYTES, files: 1 } });

const USE_AI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

// Le client OpenAI lève une erreur à la construction sans clé ; le générateur local n'en a pas besoin.
const openai = USE_AI ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 90_000, maxRetries: 1 }) : null;

const THEMES = ['Espace', 'Forêt magique', 'Pirates', 'Super-héros', 'Licornes', 'Dinosaures', 'Océan', 'Chevaliers & dragons', 'Savane', 'Robots & inventions', 'Cirque', 'Mystère & détectives', 'Fées & lutins', 'Banquise', 'Sports & champions', 'Pâtisserie & cuisine'];
const MODEL_TEXT = process.env.MODEL_TEXT || 'gpt-4o-mini';
const MAX_BASE64_BYTES = 4_200_000; // la réponse JSON doit rester sous 4,5 Mo sur Vercel

function parseInput(body) {
  const name = String(body?.name ?? '').replace(/\s+/g, ' ').trim();
  const theme = String(body?.theme ?? '').trim();
  const age = body?.age === undefined || body?.age === '' ? 7 : Number(body.age);
  if (!name) return { error: 'Indique le prénom de l’enfant.' };
  if (name.length > 30) return { error: 'Le prénom est trop long (30 caractères maximum).' };
  if (!THEMES.includes(theme)) return { error: 'Choisis l’un des thèmes proposés.' };
  if (!Number.isInteger(age) || age < 2 || age > 14) return { error: 'L’âge doit être compris entre 2 et 14 ans.' };
  return { name, theme, age };
}

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

app.post('/api/generate', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (!err) return next();
    const tooBig = err.code === 'LIMIT_FILE_SIZE';
    res.status(tooBig ? 413 : 400).json({
      error: tooBig ? 'La photo est trop lourde (4 Mo maximum). Essaie une photo plus petite.' : 'Le fichier envoyé n’a pas pu être lu.'
    });
  });
}, async (req, res) => {
  const started = Date.now();
  try {
    const input = parseInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });
    const { name, theme, age } = input;

    const warnings = [];
    let story = null;
    let mode = 'local';

    if (USE_AI && process.env.FORCE_LOCAL !== 'true') {
      try {
        ({ story } = await aiStory(openai, MODEL_TEXT, { name, theme, age }));
        mode = 'ai';
      } catch (err) {
        console.error('[story] IA indisponible ou histoire non conforme :', err?.message || err);
        warnings.push('L’écriture par IA n’a pas abouti : une histoire de notre bibliothèque a été utilisée à la place.');
      }
    }
    if (!story) {
      story = localStory({ name, theme, age, variant: Math.floor(Math.random() * storyCount({ theme, age })) });
      const check = validateStory(story, { name, age });
      if (!check.ok) throw new Error(`Histoire locale invalide : ${check.problems.join(' ')}`);
    }

    // Illustrations IA uniquement si l'histoire vient de l'IA (ou si Hugging Face est configuré) ; sinon illustrations vectorielles du thème.
    let images = { cover: null, pages: [] };
    if ((mode === 'ai' || process.env.HUGGINGFACE_API_KEY) && process.env.FORCE_LOCAL !== 'true') {
      images = await generateIllustrations({ openai: mode === 'ai' ? openai : null, story, theme, name });
      if (images.failures > 0) {
        warnings.push(`${images.failures} illustration(s) n’ont pas pu être générées ; des illustrations de remplacement du thème ont été utilisées.`);
      }
    }

    // La photo n'est lue qu'en mémoire pour la couverture, jamais stockée.
    let photo = req.file?.buffer || null;
    if (photo && !detectImageType(photo)) {
      warnings.push('La photo n’est pas au format JPEG ou PNG : elle n’a pas été ajoutée à la couverture.');
      photo = null;
    }

    let book = await buildBook({ story, theme, childName: name, images, photo });
    if (Math.ceil((book.pdf.length * 4) / 3) > MAX_BASE64_BYTES) {
      warnings.push('Les illustrations étaient trop lourdes : elles ont été remplacées par des illustrations légères.');
      book = await buildBook({ story, theme, childName: name, images: { cover: null, pages: [] }, photo });
    }

    console.log(`[generate] ${themeKey(theme)} mode=${mode} pages=${book.pageCount} pdf=${Math.round(book.pdf.length / 1024)}Ko ${Date.now() - started}ms`);

    res.json({
      ok: true,
      mode,
      warnings,
      fileName: `plumio-${slug(name) || 'histoire'}-${slug(theme)}.pdf`,
      story: {
        title: story.title,
        subtitle: story.subtitle,
        intro: story.intro,
        pages: story.pages.map((p) => ({ n: p.n, title: p.title, text: p.text }))
      },
      pageCount: book.pageCount,
      illustrated: book.illustrated,
      pdfBase64: book.pdf.toString('base64')
    });
  } catch (err) {
    console.error('[generate]', err);
    res.status(500).json({ error: 'Le livre n’a pas pu être créé. Réessaie dans un instant ; tes informations sont conservées.' });
  }
});

app.get('/api/games/catalog', (_req, res) => {
  res.json({ ok: true, bands: Object.values(BANDS), games: GAMES, themes: THEMES });
});

app.post('/api/games/pdf', async (req, res) => {
  try {
    const { name, age, theme, gameId, variant, solution } = req.body || {};
    const problem = validateGameInput({ name, age });
    if (problem) return res.status(400).json({ ok: false, error: problem });
    const band = bandOf(age);
    const known = GAMES.filter((g) => g.band === band).map((g) => g.id);
    if (gameId && gameId !== 'all' && !known.includes(gameId)) {
      return res.status(400).json({ ok: false, error: 'Ce jeu n’existe pas pour cette tranche d’âge.' });
    }
    const pdf = await buildGamesPdf({
      name, age, theme: THEMES.includes(theme) ? theme : '',
      gameIds: !gameId || gameId === 'all' ? 'all' : [gameId],
      variant: Number.isInteger(variant) && variant >= 0 && variant < 1000 ? variant : 0,
      solution: solution === true
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader('Cache-Control', 'no-store');
    res.send(pdf);
  } catch (e) {
    console.error('games pdf', e);
    res.status(500).json({ ok: false, error: 'Impossible de créer les jeux pour le moment. Réessaie dans un instant.' });
  }
});

app.get('/api/audio/status', (_req, res) => {
  res.json({ ok: true, available: ttsConfigured() });
});

app.post('/api/audio', async (req, res) => {
  if (!ttsConfigured()) return res.status(503).json({ ok: false, error: 'La voix haute qualité n’est pas activée.' });
  if (!checkRateLimit(req.ip || 'unknown')) {
    return res.status(429).json({ ok: false, error: 'Trop de demandes audio pour le moment. Utilise la lecture classique ou réessaie plus tard.' });
  }
  if (!dailyBudgetLeft()) {
    return res.status(429).json({ ok: false, error: 'La voix haute qualité est momentanément épuisée. Utilise la lecture classique.' });
  }
  try {
    const { audio, chars } = await synthesizeStory(req.body?.story);
    spendDailyChars(chars);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audio.length);
    res.setHeader('Cache-Control', 'no-store');
    res.send(audio);
  } catch (e) {
    if (!(e instanceof TtsError)) console.error('audio', e);
    res.status(e instanceof TtsError ? e.status : 500).json({ ok: false, error: e instanceof TtsError ? e.message : 'Impossible de créer l’audio pour le moment.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, ai: USE_AI });
});

// Sur Vercel, l'app est appelée comme fonction serverless et ne doit pas ouvrir de port.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

export default app;
