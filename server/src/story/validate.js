export const PAGE_COUNT = 10;

/** Longueur cible par page selon l'âge (en mots). */
export function wordTarget(age) {
  const a = Number(age);
  if (!Number.isFinite(a)) return { min: 80, max: 120 };
  if (a <= 5) return { min: 45, max: 75 };
  if (a >= 11) return { min: 100, max: 150 };
  return { min: 80, max: 120 };
}

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const words = (s) => normalize(s).split(' ').filter(Boolean);
const sentences = (s) => s.split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter((x) => words(x).length >= 4);

function trigrams(text) {
  const w = words(text);
  const set = new Set();
  for (let i = 0; i < w.length - 2; i++) set.add(w.slice(i, i + 3).join(' '));
  return set;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Valide la structure, la longueur et l'absence de répétitions. Retourne { ok, problems }.
 * Les tolérances de longueur sont volontairement larges : on rejette les pages vides ou démesurées, pas les écarts d'une dizaine de mots.
 */
export function validateStory(story, { name, age } = {}) {
  const problems = [];
  if (!story || typeof story !== 'object') return { ok: false, problems: ['Réponse vide ou illisible.'] };
  if (!story.title || String(story.title).trim().length < 3) problems.push('Titre manquant.');
  if (String(story.title || '').length > 90) problems.push('Titre trop long.');
  if (!Array.isArray(story.pages) || story.pages.length !== PAGE_COUNT) {
    return { ok: false, problems: [...problems, `Il faut exactement ${PAGE_COUNT} pages (reçu : ${Array.isArray(story.pages) ? story.pages.length : 0}).`] };
  }

  const target = wordTarget(age);
  const lo = Math.floor(target.min * 0.75);
  const hi = Math.ceil(target.max * 1.4);
  story.pages.forEach((p, i) => {
    const n = words(String(p?.text || '')).length;
    if (!p?.text || typeof p.text !== 'string') problems.push(`Page ${i + 1} : texte manquant.`);
    else if (n < lo) problems.push(`Page ${i + 1} : trop courte (${n} mots, minimum ${lo}).`);
    else if (n > hi) problems.push(`Page ${i + 1} : trop longue (${n} mots, maximum ${hi}).`);
  });
  if (problems.length) return { ok: false, problems };

  const grams = story.pages.map((p) => trigrams(p.text));
  for (let i = 0; i < grams.length; i++) {
    for (let j = i + 1; j < grams.length; j++) {
      if (jaccard(grams[i], grams[j]) > 0.25) problems.push(`Pages ${i + 1} et ${j + 1} trop similaires.`);
    }
  }

  const seen = new Map();
  story.pages.forEach((p, i) => {
    for (const s of sentences(p.text)) {
      const key = normalize(s);
      if (seen.has(key) && seen.get(key) !== i) problems.push(`Phrase répétée aux pages ${seen.get(key) + 1} et ${i + 1} : « ${s.slice(0, 60)} ».`);
      else seen.set(key, i);
    }
  });

  const openings = story.pages.flatMap((p) => sentences(p.text).map((s) => words(s).slice(0, 2).join(' ')));
  const counts = openings.reduce((m, o) => m.set(o, (m.get(o) || 0) + 1), new Map());
  const [topOpening, topCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || ['', 0];
  if (openings.length && topCount / openings.length > 0.25 && topCount > 6) {
    problems.push(`Trop de phrases commencent par « ${topOpening} ».`);
  }

  if (name) {
    const re = new RegExp(`\\b${normalize(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const perPage = story.pages.map((p) => (normalize(p.text).match(re) || []).length);
    const avg = perPage.reduce((a, b) => a + b, 0) / PAGE_COUNT;
    if (avg > 4) problems.push(`Le prénom est répété trop souvent (${avg.toFixed(1)} fois par page en moyenne).`);
    if (perPage.every((c) => c === 0)) problems.push('Le prénom de l’enfant n’apparaît jamais.');
  }

  return { ok: problems.length === 0, problems };
}
