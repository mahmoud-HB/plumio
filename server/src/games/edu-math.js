// Générateurs de maths pour les jeux éducatifs : fonctions pures, déterministes (graine), avec corrigé détaillé.
import { shuffle } from './puzzles.js';

const int = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const fmt = (x) => String(Math.round(x * 100) / 100).replace('.', ',');

const FIRST_AGE = { petits: 3, moyens: 6, grands: 9 };

/** Niveau 1-3. `level` 0 = automatique : suit l'âge exact au sein de la tranche (ex. 6 ans → 1, 7 → 2, 8 → 3). */
export function resolveLevel(age, level = 0) {
  const l = Number(level);
  if (l >= 1 && l <= 3) return l;
  const a = Number(age);
  const band = a <= 5 ? 'petits' : a >= 9 ? 'grands' : 'moyens';
  if (band === 'grands') return a <= 9 ? 1 : a <= 11 ? 2 : 3;
  return Math.min(3, Math.max(1, a - FIRST_AGE[band] + 1));
}

export const LEVEL_LABELS = { 1: 'Facile', 2: 'Moyen', 3: 'Difficile' };

// ---------- Petits : additions en images, comparaisons ----------
export function addImages(level, rnd, count = 6) {
  const maxSum = { 1: 5, 2: 8, 3: 10 }[level];
  const out = []; const seen = new Set();
  while (out.length < count) {
    const a = int(rnd, 1, maxSum - 1); const b = int(rnd, 1, maxSum - a);
    const key = `${a}+${b}`;
    if (seen.has(key) && seen.size < 12) continue;
    seen.add(key);
    out.push({ a, b, answer: a + b });
  }
  return out;
}

export function comparePairs(level, rnd, count = 6) {
  const max = { 1: 5, 2: 7, 3: 9 }[level];
  const minDiff = { 1: 3, 2: 2, 3: 1 }[level];
  const out = [];
  while (out.length < count) {
    const a = int(rnd, 1, max); const b = int(rnd, 1, max);
    if (Math.abs(a - b) < minDiff) continue;
    const ask = out.length % 3 === 2 ? 'moins' : 'plus';
    const bigger = a > b ? 'left' : 'right';
    out.push({ a, b, ask, answer: ask === 'plus' ? bigger : bigger === 'left' ? 'right' : 'left' });
  }
  return out;
}

// ---------- Moyens : tables de multiplication ----------
function tableHint(x, y) {
  if (x === 2) return `le double de ${y}`;
  if (x === 10) return `${y} dizaines`;
  if (x === 5) return `${y} × 10 ÷ 2`;
  if (x === 9) return `${y} × 10 – ${y}`;
  return y > 5 ? `${x}×5 + ${x}×${y - 5}` : `${x}×${y - 1} + ${x}`;
}

export function tables(level, rnd, count = 16) {
  const factors = { 1: [2, 5, 10], 2: [2, 3, 4, 5, 10], 3: [3, 4, 6, 7, 8, 9] }[level];
  const out = []; const seen = new Set();
  let guard = 0;
  while (out.length < count && guard++ < 500) {
    const x = pick(rnd, factors); const y = int(rnd, 2, 9);
    const flip = rnd() < 0.5;
    const key = `${Math.min(x, y)}x${Math.max(x, y)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text: flip ? `${y} × ${x}` : `${x} × ${y}`, answer: x * y, hint: tableHint(x, y) });
  }
  return out;
}

// ---------- Problèmes (moyens et grands) ----------
const OBJETS = ['billes', 'cartes', 'bonbons', 'autocollants', 'crayons', 'ballons', 'pommes', 'coquillages'];

const MOYENS = {
  1: [
    (r, n) => { const o = pick(r, OBJETS); const a = int(r, 6, 15); const b = int(r, 3, 12); return { text: `${n} range ${a} ${o} dans une boîte et ${b} dans une autre. Combien de ${o} cela fait-il en tout ?`, answer: `${a + b}`, steps: `${a} + ${b} = ${a + b}` }; },
    (r, n) => { const o = pick(r, OBJETS); const a = int(r, 12, 25); const b = int(r, 3, 9); return { text: `${n} avait ${a} ${o} et en donne ${b} à un ami. Combien de ${o} lui reste-t-il ?`, answer: `${a - b}`, steps: `${a} – ${b} = ${a - b}` }; },
    (r, n) => { const a = int(r, 8, 18); const b = int(r, 2, 6); return { text: `Dans un jardin, ${n} compte ${a} fleurs rouges et ${b} fleurs de plus qui sont jaunes. Combien y a-t-il de fleurs jaunes ?`, answer: `${a + b}`, steps: `${a} + ${b} = ${a + b}` }; },
    (r, n) => { const k = int(r, 2, 4); const p = pick(r, [2, 5, 10]); return { text: `${n} prépare ${k} sacs avec ${p} bonbons dans chaque sac. Combien de bonbons faut-il en tout ?`, answer: `${k * p}`, steps: `${k} × ${p} = ${k * p}` }; },
    (r, n) => { const a = int(r, 20, 30); const b = int(r, 4, 9); return { text: `Un bus transporte ${a} enfants. À l'arrêt de ${n}, ${b} enfants descendent. Combien reste-t-il d'enfants dans le bus ?`, answer: `${a - b}`, steps: `${a} – ${b} = ${a - b}` }; },
    (r, n) => { const a = int(r, 10, 20); return { text: `${n} lit ${a} pages le matin et autant l'après-midi. Combien de pages cela fait-il dans la journée ?`, answer: `${2 * a}`, steps: `${a} + ${a} = ${2 * a}` }; },
    (r, n) => { const t = pick(r, [10, 12, 14, 16, 18, 20]); return { text: `${n} partage ${t} bonbons en deux parts égales. Combien de bonbons y a-t-il dans chaque part ?`, answer: `${t / 2}`, steps: `${t} ÷ 2 = ${t / 2}` }; }
  ],
  2: [
    (r, n) => { const a = int(r, 25, 60); const b = int(r, 18, 35); return { text: `${n} a ${a} images dans son album et en colle ${b} de plus. Combien d'images y a-t-il maintenant ?`, answer: `${a + b}`, steps: `${a} + ${b} = ${a + b}` }; },
    (r, n) => { const a = int(r, 60, 95); const b = int(r, 17, 38); return { text: `Un jeu contient ${a} cartes. ${n} en retire ${b}. Combien reste-t-il de cartes ?`, answer: `${a - b}`, steps: `${a} – ${b} = ${a - b}` }; },
    (r, n) => { const k = int(r, 3, 8); const p = pick(r, [3, 4, 5, 6]); return { text: `${n} achète ${k} paquets de ${p} gâteaux. Combien de gâteaux cela fait-il ?`, answer: `${k * p}`, steps: `${k} × ${p} = ${k * p}` }; },
    (r, n) => { const k = pick(r, [3, 4, 5]); const p = int(r, 3, 9); return { text: `${n} partage ${k * p} billes entre ${k} amis, à parts égales. Combien de billes chacun reçoit-il ?`, answer: `${p}`, steps: `${k * p} ÷ ${k} = ${p}` }; },
    (r, n) => { const a = int(r, 2, 4); const b = int(r, 5, 9); return { text: `Un cahier coûte ${a} € et un stylo ${b} €. Combien paie ${n} pour 1 cahier et 1 stylo ?`, answer: `${a + b} €`, steps: `${a} + ${b} = ${a + b}` }; },
    (r, n) => { const h = int(r, 2, 6); return { text: `Le film dure ${h} heures. Combien de minutes cela fait-il pour ${n} ? (1 heure = 60 minutes)`, answer: `${h * 60} minutes`, steps: `${h} × 60 = ${h * 60}` }; },
    (r, n) => { const a = int(r, 30, 70); return { text: `${n} marque ${a} points à la première manche. À la seconde, le jeu en rapporte le double. Combien de points la seconde manche rapporte-t-elle ?`, answer: `${2 * a}`, steps: `${a} × 2 = ${2 * a}` }; }
  ],
  3: [
    (r, n) => { const p = int(r, 3, 8); const k = int(r, 3, 6); const bill = Math.ceil((p * k + 1) / 10) * 10; return { text: `Un livre coûte ${p} €. ${n} en achète ${k} et paie avec ${bill} €. Combien lui rend-on ?`, answer: `${bill - p * k} €`, steps: `${p} × ${k} = ${p * k} puis ${bill} – ${p * k} = ${bill - p * k}` }; },
    (r, n) => { const h = int(r, 13, 17); const d = pick(r, [45, 50, 55]); const end = (h * 60 + 30 + d); return { text: `Le spectacle commence à ${h} h 30 et dure ${d} minutes. À quelle heure finit-il pour ${n} ?`, answer: `${Math.floor(end / 60)} h ${String(end % 60).padStart(2, '0')}`, steps: `30 + ${d} = ${30 + d} min, soit ${Math.floor(end / 60)} h ${String(end % 60).padStart(2, '0')}` }; },
    (r, n) => { const k = pick(r, [6, 7, 8, 9]); const p = int(r, 4, 9); return { text: `${n} range ${k * p} photos dans un album : ${k} photos par page. Combien de pages sont remplies ?`, answer: `${p}`, steps: `${k * p} ÷ ${k} = ${p}` }; },
    (r, n) => { const a = int(r, 120, 260); const b = int(r, 85, 190); return { text: `Dimanche, ${n} fait ${a} pas. Lundi, ${b} pas de plus que dimanche. Combien de pas lundi ?`, answer: `${a + b}`, steps: `${a} + ${b} = ${a + b}` }; },
    (r, n) => { const k = int(r, 4, 8); const p = int(r, 6, 9); const g = int(r, 3, 9); return { text: `${n} prépare ${k} boîtes de ${p} biscuits, puis en mange ${g}. Combien de biscuits reste-t-il ?`, answer: `${k * p - g}`, steps: `${k} × ${p} = ${k * p} puis ${k * p} – ${g} = ${k * p - g}` }; },
    (r, n) => { const w = int(r, 4, 9); const l = int(r, 10, 15); return { text: `Un cadre mesure ${l} cm de long et ${w} cm de large. ${n} veut en faire le tour avec un ruban. Quelle longueur de ruban faut-il ?`, answer: `${2 * (l + w)} cm`, steps: `(${l} + ${w}) × 2 = ${2 * (l + w)}` }; },
    (r, n) => { const a = int(r, 3, 6); const k = int(r, 3, 5); const t = a * k + int(r, 1, a - 1); return { text: `${n} range ${t} jouets dans des caisses de ${a} jouets. Combien de caisses sont pleines, et combien de jouets restent dehors ?`, answer: `${k} caisses, ${t - a * k} dehors`, steps: `${t} ÷ ${a} = ${k} reste ${t - a * k}` }; }
  ]
};

const GRANDS = {
  1: [
    (r, n) => { const L = int(r, 8, 20); const l = int(r, 4, 7); return { text: `Un rectangle mesure ${L} cm sur ${l} cm. ${n} calcule son périmètre. Que trouve-t-on ?`, answer: `${2 * (L + l)} cm`, steps: `(${L} + ${l}) × 2 = ${2 * (L + l)}` }; },
    (r, n) => { const d = pick(r, [4, 8, 12]); const t = d * int(r, 3, 8); return { text: `Un quart de ${t} billes appartient à ${n}. Combien cela fait-il de billes ?`, answer: `${t / 4}`, steps: `${t} ÷ 4 = ${t / 4}` }; },
    (r, n) => { const a = int(r, 120, 480); const b = int(r, 130, 390); return { text: `${n} lit un livre de ${a} pages et un autre de ${b} pages. Combien de pages ont été lues en tout ?`, answer: `${a + b}`, steps: `${a} + ${b} = ${a + b}` }; },
    (r, n) => { const p = pick(r, [20, 30, 40, 50, 60, 80]); return { text: `Combien font 10 % de ${p * 10} ? (${n} s'entraîne au calcul des pourcentages)`, answer: `${p}`, steps: `10 % = diviser par 10 : ${p * 10} ÷ 10 = ${p}` }; },
    (r, n) => { const k = int(r, 12, 25); const p = int(r, 6, 9); return { text: `${n} achète ${p} paquets de ${k} images. Combien d'images possède-t-il en tout ?`.replace("possède-t-il", 'cela fait-il'), answer: `${k * p}`, steps: `${k} × ${p} = ${k * p}` }; },
    (r, n) => { const m = int(r, 2, 9); return { text: `${n} parcourt ${m} km à pied. Combien de mètres cela représente-t-il ? (1 km = 1 000 m)`, answer: `${m * 1000} m`, steps: `${m} × 1 000 = ${m * 1000}` }; },
    (r, n) => { const a = int(r, 3, 9); const b = int(r, 20, 60); return { text: `${n} a ${a} classeurs avec ${b} cartes chacun. Combien de cartes cela fait-il ?`, answer: `${a * b}`, steps: `${a} × ${b} = ${a * b}` }; }
  ],
  2: [
    (r, n) => { const L = int(r, 6, 15); const l = int(r, 4, 9); return { text: `Le jardin de ${n} est un rectangle de ${L} m sur ${l} m. Quelle est son aire ?`, answer: `${L * l} m²`, steps: `${L} × ${l} = ${L * l}` }; },
    (r, n) => { const p = pick(r, [20, 40, 60, 80, 120, 200]); return { text: `Un jeu coûte ${p} €. ${n} bénéficie de 25 % de réduction. Quel est le prix payé ?`, answer: `${p * 0.75} €`.replace('.', ','), steps: `25 % de ${p} = ${p / 4} ; ${p} – ${p / 4} = ${p * 0.75}` }; },
    (r, n) => { const a = int(r, 11, 17); const b = int(r, 11, 17); let c = int(r, 11, 17); c += (3 - ((a + b + c) % 3)) % 3; const m = (a + b + c) / 3; return { text: `${n} a eu ${a}, ${b} et ${c} sur 20 en trois contrôles. Quelle est sa moyenne ?`, answer: `${fmt(m)} / 20`, steps: `(${a} + ${b} + ${c}) ÷ 3 = ${a + b + c} ÷ 3 = ${fmt(m)}` }; },
    (r, n) => { const k = pick(r, [3, 4, 5]); const t = k * int(r, 4, 9) * 2; return { text: `Les ${t} élèves de la classe de ${n} forment des groupes de ${t / k} élèves. Combien de groupes y a-t-il ?`, answer: `${k}`, steps: `${t} ÷ ${t / k} = ${k}` }; },
    (r, n) => { const km = int(r, 2, 8); return { text: `${n} court ${km},5 km. Combien de mètres cela fait-il ?`, answer: `${km * 1000 + 500} m`, steps: `${km},5 km = ${km} × 1 000 + 500 = ${km * 1000 + 500} m` }; },
    (r, n) => { const t = int(r, 3, 9) * 8; return { text: `Trois huitièmes de ${t} mètres sont réservés à ${n}. Quelle longueur cela représente-t-il ?`, answer: `${(t / 8) * 3} m`, steps: `${t} ÷ 8 = ${t / 8} puis ${t / 8} × 3 = ${(t / 8) * 3}` }; },
    (r, n) => { const k = int(r, 2, 4); const p = int(r, 12, 28); const c = int(r, 5, 9); return { text: `${n} achète ${k} jeux à ${p} € et un livre à ${c} €. Combien dépense-t-il en tout ?`.replace('dépense-t-il', 'cela fait-il'), answer: `${k * p + c} €`, steps: `${k} × ${p} = ${k * p} puis ${k * p} + ${c} = ${k * p + c}` }; }
  ],
  3: [
    (r, n) => { const x = int(r, 4, 12); const m = pick(r, [3, 4, 6, 7]); const add = int(r, 3, 12); return { text: `${n} pense à un nombre. Il est multiplié par ${m}, puis on ajoute ${add} : on obtient ${x * m + add}. Quel est ce nombre ?`, answer: `${x}`, steps: `${x * m + add} – ${add} = ${x * m} puis ${x * m} ÷ ${m} = ${x}` }; },
    (r, n) => { const v = pick(r, [4, 5, 6, 8, 10, 12]); const h = pick(r, [2, 3, 4]); return { text: `${n} roule en vélo à ${v * 3} km/h pendant ${h} heures. Quelle distance parcourt-il ?`.replace('parcourt-il', 'est parcourue'), answer: `${v * 3 * h} km`, steps: `distance = vitesse × temps : ${v * 3} × ${h} = ${v * 3 * h}` }; },
    (r, n) => { const b = int(r, 6, 14); const h = int(r, 4, 9) * 2; return { text: `Un triangle de ${n} a une base de ${b} cm et une hauteur de ${h} cm. Quelle est son aire ?`, answer: `${(b * h) / 2} cm²`, steps: `base × hauteur ÷ 2 = ${b} × ${h} ÷ 2 = ${(b * h) / 2}` }; },
    (r, n) => { const g = pick(r, [3, 4, 5, 6]); const p = int(r, 2, 4); const pr = g * int(r, 2, 4); return { text: `${g} baguettes coûtent ${pr} €. Combien paie ${n} pour ${g * p} baguettes ? (proportionnalité)`, answer: `${pr * p} €`, steps: `${g * p} baguettes = ${p} fois ${g} baguettes : ${pr} × ${p} = ${pr * p}` }; },
    (r, n) => { const a = int(r, 12, 24); const p = pick(r, [10, 20, 25, 50]); const total = (100 / p) * a; return { text: `${n} a lu ${a} pages, soit ${p} % de son livre. Combien le livre a-t-il de pages ?`, answer: `${total}`, steps: `${p} % = 1/${100 / p} du livre : ${a} × ${100 / p} = ${total}` }; },
    (r, n) => { const a = int(r, 2, 5); const b = int(r, 3, 9); const c = int(r, 2, 6); return { text: `${n} calcule ${a} + ${b} × ${c}. Quel résultat doit-on trouver ? (la multiplication passe avant l'addition)`, answer: `${a + b * c}`, steps: `${b} × ${c} = ${b * c} puis ${a} + ${b * c} = ${a + b * c}` }; },
    (r, n) => { const w = int(r, 3, 6); const L = int(r, 7, 12); const sc = int(r, 2, 3); return { text: `Un plan de ${n} réduit une pièce de ${L * sc} m sur ${w * sc} m à l'échelle 1/${sc}. Quelle est l'aire du plan, en m² ?`, answer: `${L * w} m²`, steps: `dimensions réduites : ${L} m et ${w} m, donc ${L} × ${w} = ${L * w}` }; }
  ]
};

export function problems(band, level, rnd, name, count = 6) {
  const bank = band === 'grands' ? GRANDS : MOYENS;
  const picked = shuffle(bank[level], rnd).slice(0, count);
  return picked.map((fn) => fn(rnd, name));
}
