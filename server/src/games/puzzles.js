// Générateurs de jeux : fonctions pures, déterministes pour une graine donnée (prénom + jeu + variante).

export function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

export function makeRng(seedStr) {
  let a = hashSeed(String(seedStr));
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rnd) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Majuscules sans accents, lettres A-Z uniquement (pour les grilles et les codes). */
export const toGridWord = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/œ/gi, 'OE').replace(/æ/gi, 'AE').replace(/ø/gi, 'O').replace(/ß/g, 'SS').replace(/[^a-zA-Z]/g, '').toUpperCase();

// ---------- Labyrinthe ----------
export function maze(cols, rows, rnd) {
  const east = Array.from({ length: rows }, () => Array(cols).fill(true));
  const south = Array.from({ length: rows }, () => Array(cols).fill(true));
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const nb = shuffle([[0, 1], [1, 0], [0, -1], [-1, 0]], rnd)
      .map(([dr, dc]) => [r + dr, c + dc, dr, dc])
      .filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc]);
    if (!nb.length) { stack.pop(); continue; }
    const [nr, nc, dr, dc] = nb[0];
    if (dc === 1) east[r][c] = false;
    else if (dc === -1) east[nr][nc] = false;
    else if (dr === 1) south[r][c] = false;
    else south[nr][nc] = false;
    seen[nr][nc] = true;
    stack.push([nr, nc]);
  }
  return { cols, rows, east, south, path: solveMaze({ cols, rows, east, south }) };
}

function solveMaze({ cols, rows, east, south }) {
  const prev = new Map();
  const key = (r, c) => r * cols + c;
  const queue = [[0, 0]];
  prev.set(0, null);
  while (queue.length) {
    const [r, c] = queue.shift();
    if (r === rows - 1 && c === cols - 1) break;
    const moves = [];
    if (c < cols - 1 && !east[r][c]) moves.push([r, c + 1]);
    if (r < rows - 1 && !south[r][c]) moves.push([r + 1, c]);
    if (c > 0 && !east[r][c - 1]) moves.push([r, c - 1]);
    if (r > 0 && !south[r - 1][c]) moves.push([r - 1, c]);
    for (const [nr, nc] of moves) {
      if (!prev.has(key(nr, nc))) { prev.set(key(nr, nc), [r, c]); queue.push([nr, nc]); }
    }
  }
  const path = [];
  let cur = [rows - 1, cols - 1];
  while (cur) { path.push(cur); cur = prev.get(key(cur[0], cur[1])); }
  return path.reverse();
}

// ---------- Mots mêlés ----------
export const DIRS_EASY = [[0, 1], [1, 0]];
export const DIRS_ALL = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];

export function wordSearch(words, size, rnd, dirs = DIRS_EASY) {
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const placed = [];
  const list = [...new Set(words.map(toGridWord).filter((w) => w.length >= 2 && w.length <= size))].sort((a, b) => b.length - a.length);
  for (const word of list) {
    for (let attempt = 0; attempt < 300; attempt++) {
      const [dr, dc] = dirs[Math.floor(rnd() * dirs.length)];
      const r0 = Math.floor(rnd() * size);
      const c0 = Math.floor(rnd() * size);
      const r1 = r0 + dr * (word.length - 1);
      const c1 = c0 + dc * (word.length - 1);
      if (r1 < 0 || r1 >= size || c1 < 0 || c1 >= size) continue;
      let ok = true;
      for (let i = 0; i < word.length && ok; i++) {
        const ch = grid[r0 + dr * i][c0 + dc * i];
        if (ch && ch !== word[i]) ok = false;
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) grid[r0 + dr * i][c0 + dc * i] = word[i];
      placed.push({ word, r: r0, c: c0, dr, dc });
      break;
    }
  }
  const letters = 'ABCDEFGHIJKLMNOPRSTUVZEAIRSNT';
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = letters[Math.floor(rnd() * letters.length)];
  return { size, grid, placed };
}

// ---------- Sudoku ----------
function candidates(g, n, br, bc, r, c) {
  const used = new Set();
  for (let i = 0; i < n; i++) { used.add(g[r][i]); used.add(g[i][c]); }
  const r0 = r - (r % br);
  const c0 = c - (c % bc);
  for (let i = 0; i < br; i++) for (let j = 0; j < bc; j++) used.add(g[r0 + i][c0 + j]);
  const out = [];
  for (let v = 1; v <= n; v++) if (!used.has(v)) out.push(v);
  return out;
}

// Avec rnd : remplit la grille avec une solution aléatoire (et s'arrête). Sans rnd : compte les solutions jusqu'à `limit`.
function solveCount(g, n, br, bc, limit, rnd = null) {
  let best = null;
  let bestC = null;
  outer: for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (g[r][c]) continue;
      const cand = candidates(g, n, br, bc, r, c);
      if (!best || cand.length < bestC.length) { best = [r, c]; bestC = cand; }
      if (bestC.length <= 1) break outer;
    }
  }
  if (!best) return 1;
  if (!bestC.length) return 0;
  const [r, c] = best;
  let count = 0;
  for (const v of rnd ? shuffle(bestC, rnd) : bestC) {
    g[r][c] = v;
    count += solveCount(g, n, br, bc, limit - count, rnd);
    if (rnd && count > 0) return count;
    g[r][c] = 0;
    if (count >= limit) return count;
  }
  return count;
}

/** n = 4 (2x2), 6 (2x3) ou 9 (3x3). blanks = nombre de cases à vider (solution unique garantie). */
export function sudoku(n, blanks, rnd) {
  const [br, bc] = n === 4 ? [2, 2] : n === 6 ? [2, 3] : [3, 3];
  const solution = Array.from({ length: n }, () => Array(n).fill(0));
  solveCount(solution, n, br, bc, 1, rnd);
  const puzzle = solution.map((row) => [...row]);
  const cells = shuffle(Array.from({ length: n * n }, (_, i) => [Math.floor(i / n), i % n]), rnd);
  let removed = 0;
  for (const [r, c] of cells) {
    if (removed >= blanks) break;
    const keep = puzzle[r][c];
    puzzle[r][c] = 0;
    const copy = puzzle.map((row) => [...row]);
    if (solveCount(copy, n, br, bc, 2) === 1) removed += 1;
    else puzzle[r][c] = keep;
  }
  return { n, br, bc, puzzle, solution };
}

// ---------- Codes ----------
export function caesar(text, shift) {
  return text.replace(/[A-Z]/g, (ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65));
}

export function scramble(word, rnd) {
  const letters = word.split('');
  if (new Set(letters).size < 2) return word;
  for (let i = 0; i < 20; i++) {
    const s = shuffle(letters, rnd).join('');
    if (s !== word) return s;
  }
  return letters.reverse().join('');
}

// ---------- Calculs ----------
export function arithmetic(age, count, rnd) {
  const a = Number(age);
  const max = a <= 6 ? 20 : a === 7 ? 50 : 100;
  const ops = [];
  const seen = new Set();
  while (ops.length < count) {
    const kind = a >= 8 && rnd() < 0.3 ? 'mul' : rnd() < 0.5 ? 'add' : 'sub';
    let x; let y; let text; let answer;
    if (kind === 'add') { x = 2 + Math.floor(rnd() * (max - 4)); y = 1 + Math.floor(rnd() * (max - x)); text = `${x} + ${y}`; answer = x + y; }
    else if (kind === 'sub') { x = 5 + Math.floor(rnd() * (max - 5)); y = 1 + Math.floor(rnd() * (x - 1)); text = `${x} – ${y}`; answer = x - y; }
    else { x = [2, 3, 4, 5, 10][Math.floor(rnd() * 5)]; y = 2 + Math.floor(rnd() * 8); text = `${x} × ${y}`; answer = x * y; }
    if (seen.has(text)) continue;
    seen.add(text);
    ops.push({ text, answer });
  }
  return ops;
}

// ---------- Relie les points : formes en coordonnées 0..1 ----------
export function dotShape(kind) {
  if (kind === 'heart') {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * Math.PI * 2;
      const x = 16 * Math.sin(t) ** 3;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push([0.5 + x / 36, 0.48 - y / 36]);
    }
    return pts;
  }
  if (kind === 'house') {
    return [[0.18, 0.92], [0.18, 0.5], [0.08, 0.5], [0.5, 0.1], [0.92, 0.5], [0.82, 0.5], [0.82, 0.92], [0.6, 0.92], [0.6, 0.66], [0.4, 0.66], [0.4, 0.92]];
  }
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? 0.2 : 0.48;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push([0.5 + Math.cos(a) * rad, 0.52 + Math.sin(a) * rad]);
  }
  return pts;
}

// ---------- Compte les formes : dispersion sans chevauchement ----------
export function scatter(counts, width, height, rnd, size) {
  const items = [];
  const spots = [];
  counts.forEach((n, type) => {
    for (let k = 0; k < n; k++) {
      for (let attempt = 0; attempt < 400; attempt++) {
        const x = size + rnd() * (width - 2 * size);
        const y = size + rnd() * (height - 2 * size);
        if (spots.every(([sx, sy]) => Math.hypot(sx - x, sy - y) > size * 2.1)) {
          spots.push([x, y]);
          items.push({ type, x, y });
          break;
        }
      }
    }
  });
  return items;
}
