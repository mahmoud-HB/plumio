// Rendu PDF des jeux à imprimer : pages A4 portrait, coordonnées « depuis le haut de la page ».
import { PDFDocument, rgb } from 'pdf-lib';
import { PAGE, sanitize, wrapParagraph } from '../pdf/layout.js';
import { loadFonts, PALETTES } from '../pdf/book.js';
import { BANDS, GAMES, bandOf, findGame, gamesFor, themeData } from './catalog.js';
import * as P from './puzzles.js';

const C = {
  paper: rgb(1, 0.985, 0.955),
  ink: rgb(0.2, 0.17, 0.3),
  plum: rgb(0.43, 0.32, 0.68),
  lavender: rgb(0.86, 0.82, 0.97),
  blush: rgb(0.98, 0.86, 0.9),
  muted: rgb(0.58, 0.54, 0.7),
  grey: rgb(0.74, 0.72, 0.8),
  white: rgb(1, 1, 1)
};
const pal = (a) => rgb(a[0], a[1], a[2]);

const AREA = { x: 56, top: 232, w: PAGE.width - 112, h: 520 };

class Canvas {
  constructor(page, fonts) { this.page = page; this.f = fonts; }
  y(top) { return PAGE.height - top; }
  text(str, x, top, { font = 'body', size = 12, color = C.ink, align = 'left', opacity = 1 } = {}) {
    const s = sanitize(str);
    if (!s) return 0;
    const font_ = this.f[font];
    const w = font_.widthOfTextAtSize(s, size);
    const px = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    this.page.drawText(s, { x: px, y: this.y(top + size * 0.8), size, font: font_, color, opacity });
    return w;
  }
  width(str, font, size) { return this.f[font].widthOfTextAtSize(sanitize(str), size); }
  paragraph(str, x, top, w, { font = 'body', size = 12, leading = 1.45, align = 'left', color = C.ink } = {}) {
    const lines = wrapParagraph(sanitize(str), this.f[font], size, w);
    lines.forEach((l, i) => this.text(l, align === 'center' ? x + w / 2 : x, top + i * size * leading, { font, size, align, color }));
    return lines.length * size * leading;
  }
  line(x1, t1, x2, t2, { w = 1, color = C.ink, dash, cap = 'butt', opacity = 1 } = {}) {
    this.page.drawLine({
      start: { x: x1, y: this.y(t1) }, end: { x: x2, y: this.y(t2) }, thickness: w, color, opacity,
      ...(dash ? { dashArray: dash } : {}), lineCap: cap === 'round' ? 1 : 0
    });
  }
  rect(x, top, w, h, { fill, stroke, sw = 1, r = 0, opacity = 1 } = {}) {
    if (r > 0) {
      const d = `M ${x + r} ${top} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${top + r} V ${top + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${top + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${top + h - r} V ${top + r} A ${r} ${r} 0 0 1 ${x + r} ${top} Z`;
      this.page.drawSvgPath(d, { x: 0, y: PAGE.height, color: fill, borderColor: stroke, borderWidth: stroke ? sw : 0, opacity, borderOpacity: 1 });
    } else {
      this.page.drawRectangle({ x, y: this.y(top + h), width: w, height: h, color: fill, borderColor: stroke, borderWidth: stroke ? sw : 0, opacity });
    }
  }
  circle(cx, cy, r, { fill, stroke, sw = 1, opacity = 1 } = {}) {
    this.page.drawCircle({ x: cx, y: this.y(cy), size: r, color: fill, borderColor: stroke, borderWidth: stroke ? sw : 0, opacity });
  }
  path(d, x, top, scale, { fill, stroke, sw = 1, opacity = 1 } = {}) {
    this.page.drawSvgPath(d, { x, y: this.y(top), scale, color: fill, borderColor: stroke, borderWidth: stroke ? sw : 0, opacity });
  }
}

const STAR_PATH = 'M 0 -10 L 3 -3 L 10 -3 L 4.5 2 L 6.5 9 L 0 5 L -6.5 9 L -4.5 2 L -10 -3 L -3 -3 Z';
const HEART_PATH = 'M 0 8 C -12 -1 -9 -10 -4 -10 C -2 -10 0 -8 0 -6 C 0 -8 2 -10 4 -10 C 9 -10 12 -1 0 8 Z';

const sanitizeName = (name) => P.toGridWord(name);
const hashOf = (s) => P.hashSeed(String(s));

// ---------- Cadre commun de page ----------
function frame(cv, ctx, { title, mission, game, solution }) {
  const { displayName: name, data, band } = ctx;
  const accent = pal(PALETTES[data.key]?.accent || PALETTES.forest.accent);
  const top = pal(PALETTES[data.key]?.top || PALETTES.forest.top);
  cv.rect(0, 0, PAGE.width, PAGE.height, { fill: C.paper });
  cv.rect(0, 0, PAGE.width, 58, { fill: C.plum });
  cv.rect(0, 58, PAGE.width, 7, { fill: accent });
  cv.path(STAR_PATH, 56, 29, 1.1, { fill: accent });
  cv.text('PLUMIO', 74, 20, { font: 'title', size: 19, color: C.white });
  cv.text(`Jeux à imprimer · ${BANDS[band].label}`, PAGE.width - 56, 24, { font: 'label', size: 12, color: C.lavender, align: 'right' });

  cv.text(solution ? `Corrigé · ${title}` : title, PAGE.width / 2, 92, { font: 'title', size: 30, color: C.ink, align: 'center' });
  cv.rect(PAGE.width / 2 - 36, 133, 72, 4, { fill: accent, r: 2 });
  const hMission = cv.paragraph(mission, 70, 152, PAGE.width - 140, { font: 'italic', size: 13.5, align: 'center', color: C.ink });
  void top; void hMission;

  // Pied de page
  cv.rect(56, PAGE.height - 74, PAGE.width - 112, 1, { fill: C.lavender });
  const foot = solution ? `Pour les parents : voici les réponses du jeu de ${name}.` : `Bravo ${name} !`;
  const fw = cv.text(foot, PAGE.width / 2, PAGE.height - 56, { font: 'title', size: 15, color: C.plum, align: 'center' });
  if (!solution) {
    [-1, 1].forEach((k) => cv.path(STAR_PATH, PAGE.width / 2 + k * (fw / 2 + 22), PAGE.height - 47, 0.9, { fill: accent }));
  }
  cv.text('plumio-theta.vercel.app', PAGE.width / 2, PAGE.height - 30, { font: 'body', size: 8.5, color: C.muted, align: 'center' });
  void game;
}

// ---------- Jeux ----------
function drawColoring(cv, ctx) {
  const kinds = ['rocket', 'fish', 'house'];
  const byTheme = { space: 'rocket', robots: 'rocket', heroes: 'rocket', ocean: 'fish', pirates: 'fish', dinos: 'house' };
  const kind = byTheme[ctx.data.key] || kinds[hashOf(ctx.name + ctx.data.key) % 3];
  const s = { w: 3.6, color: C.ink };
  const cx = PAGE.width / 2;
  const top = AREA.top + 10;
  const sc = 2.5;
  const ox = cx - 50 * sc;
  const st = { stroke: s.color, sw: s.w };
  if (kind === 'rocket') {
    cv.path('M 50 5 C 72 30 76 70 70 110 L 30 110 C 24 70 28 30 50 5 Z', ox, top, sc, st);
    cv.path('M 30 85 L 6 122 L 30 110 Z', ox, top, sc, st);
    cv.path('M 70 85 L 94 122 L 70 110 Z', ox, top, sc, st);
    cv.path('M 38 112 Q 50 150 62 112 Z', ox, top, sc, st);
    cv.circle(ox + 50 * sc, top + 52 * sc, 13 * sc, st);
    cv.circle(ox + 50 * sc, top + 52 * sc, 7 * sc, st);
    cv.path('M 36 98 H 64', ox, top, sc, st);
    [[-18, 20], [105, 40], [-10, 100], [112, 105], [10, 140], [90, 145]].forEach(([x, y]) => cv.path(STAR_PATH, ox + x * sc, top + y * sc, 1.4, st));
    cv.circle(ox + 112 * sc, top + 10 * sc, 11 * sc * 0.55, st);
  } else if (kind === 'fish') {
    cv.path('M 5 70 C 25 25 80 25 100 70 C 80 115 25 115 5 70 Z', ox, top + 40, sc, st);
    cv.path('M 100 70 L 132 40 L 132 100 Z', ox, top + 40, sc, st);
    cv.path('M 45 38 Q 60 10 78 40', ox, top + 40, sc, st);
    cv.circle(ox + 28 * sc, top + 40 + 62 * sc, 5 * sc, st);
    cv.path('M 50 50 Q 62 70 50 90 M 66 48 Q 78 70 66 92', ox, top + 40, sc, st);
    [[20, 20, 6], [34, 6, 4], [8, 8, 3], [118, 15, 5], [125, 130, 6], [10, 120, 4]].forEach(([x, y, r]) => cv.circle(ox + x * sc, top + 40 + y * sc, r * sc, st));
    cv.path('M 0 140 Q 8 120 0 100 M 14 140 Q 22 118 14 98', ox + 5 * sc, top + 40, sc, st);
    cv.path('M 0 125 Q 8 110 16 125 T 32 125 T 48 125 T 64 125 T 80 125 T 96 125 T 112 125 T 128 125', ox, top + 40 + 25 * sc, sc, st);
  } else {
    cv.path('M 20 60 H 80 V 110 H 20 Z', ox + 5 * sc, top + 20, sc * 1.3, st);
    cv.path('M 10 60 L 50 20 L 90 60 Z', ox + 5 * sc, top + 20, sc * 1.3, st);
    cv.path('M 42 110 V 82 H 58 V 110', ox + 5 * sc, top + 20, sc * 1.3, st);
    cv.path('M 26 70 H 38 V 82 H 26 Z M 62 70 H 74 V 82 H 62 Z', ox + 5 * sc, top + 20, sc * 1.3, st);
    cv.path('M 66 20 V 38 H 76 V 28', ox + 5 * sc, top + 20, sc * 1.3, st);
    cv.circle(ox + 4 * sc + 105 * sc, top + 22, 14 * sc * 0.8, st);
    cv.path('M 0 112 H 110', ox, top + 20, sc * 1.3, st);
    [[-10, 112], [112, 112]].forEach(([x, y]) => cv.path('M 0 0 C -9 -9 -9 -24 0 -26 C 9 -24 9 -9 0 0 Z', ox + x * sc + 20, top + 20 + y * sc * 1.3 - 5, 2.2, st));
  }
  const bannerTop = AREA.top + AREA.h - 70;
  cv.rect(AREA.x + 40, bannerTop, AREA.w - 80, 56, { fill: C.white, stroke: C.plum, sw: 2.5, r: 28 });
  cv.text(`Le dessin de ${ctx.displayName}`, PAGE.width / 2, bannerTop + 14, { font: 'title', size: 24, color: C.plum, align: 'center' });
}

function drawDots(cv, ctx, solution) {
  const kind = ['star', 'heart', 'house'][hashOf(ctx.name + ctx.variant) % 3];
  const pts = P.dotShape(kind);
  const size = 400;
  const ox = PAGE.width / 2 - size / 2;
  const top = AREA.top + 40;
  const at = ([x, y]) => [ox + x * size, top + y * size];
  if (solution) {
    pts.forEach((p, i) => {
      const [x1, y1] = at(p);
      const [x2, y2] = at(pts[(i + 1) % pts.length]);
      cv.line(x1, y1, x2, y2, { w: 3, color: C.plum, cap: 'round' });
    });
  }
  const cxm = ox + size / 2;
  const cym = top + size * 0.5;
  pts.forEach((p, i) => {
    const [x, y] = at(p);
    cv.circle(x, y, 5, { fill: C.ink });
    const dx = x - cxm; const dy = y - cym;
    const d = Math.hypot(dx, dy) || 1;
    const lx = x + (dx / d) * 18; const ly = y + (dy / d) * 18;
    cv.text(String(i + 1), lx, ly - 9, { font: 'title', size: 17, color: C.plum, align: 'center' });
  });
  cv.text('Commence au 1, puis suis les nombres dans l’ordre et reviens au point de départ.', PAGE.width / 2, AREA.top + AREA.h - 24, { font: 'label', size: 11, color: C.muted, align: 'center' });
}

function drawMaze(cv, ctx, solution) {
  const dims = { petits: [6, 8], moyens: [12, 16], grands: [18, 22] }[ctx.band];
  const [cols, rows] = dims;
  const rnd = P.makeRng(`${ctx.seed}|maze`);
  const m = P.maze(cols, rows, rnd);
  const cell = Math.floor(Math.min(AREA.w / cols, (AREA.h - 40) / rows));
  const gw = cell * cols; const gh = cell * rows;
  const ox = PAGE.width / 2 - gw / 2;
  const top = AREA.top + 24;
  const w = ctx.band === 'petits' ? 4 : ctx.band === 'moyens' ? 2.6 : 2;
  const opts = { w, color: C.ink, cap: 'round' };
  cv.line(ox + cell, top, ox + gw, top, opts); // entrée ouverte en haut à gauche
  cv.line(ox, top + gh, ox + gw - cell, top + gh, opts); // sortie ouverte en bas à droite
  cv.line(ox, top, ox, top + gh, opts);
  cv.line(ox + gw, top, ox + gw, top + gh, opts);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (m.east[r][c] && c < cols - 1) cv.line(ox + (c + 1) * cell, top + r * cell, ox + (c + 1) * cell, top + (r + 1) * cell, opts);
      if (m.south[r][c] && r < rows - 1) cv.line(ox + c * cell, top + (r + 1) * cell, ox + (c + 1) * cell, top + (r + 1) * cell, opts);
    }
  }
  cv.text('DÉPART', ox + cell / 2, top - 18, { font: 'label', size: 10, color: C.plum, align: 'center' });
  cv.text('ARRIVÉE', ox + gw - cell / 2, top + gh + 5, { font: 'label', size: 10, color: C.plum, align: 'center' });
  if (solution) {
    const pts = [[-0.5, 0], ...m.path.map(([r, c]) => [r + 0.5, c + 0.5]), [rows, cols - 0.5]].map(([r, c]) => [ox + c * cell + (r === -0.5 ? 0 : 0), top + r * cell]);
    const pth = [[ox + cell / 2, top], ...m.path.map(([r, c]) => [ox + (c + 0.5) * cell, top + (r + 0.5) * cell]), [ox + gw - cell / 2, top + gh]];
    void pts;
    for (let i = 0; i < pth.length - 1; i++) cv.line(pth[i][0], pth[i][1], pth[i + 1][0], pth[i + 1][1], { w: Math.max(2.5, cell * 0.22), color: C.plum, cap: 'round', opacity: 0.75 });
  }
}

function drawCount(cv, ctx, solution) {
  const rnd = P.makeRng(`${ctx.seed}|count`);
  const counts = [2 + Math.floor(rnd() * 5), 2 + Math.floor(rnd() * 5), 2 + Math.floor(rnd() * 5)];
  const accent = pal(PALETTES[ctx.data.key]?.accent || PALETTES.forest.accent);
  const zoneH = 370;
  cv.rect(AREA.x, AREA.top, AREA.w, zoneH, { fill: C.white, stroke: C.lavender, sw: 2, r: 18 });
  const items = P.scatter(counts, AREA.w, zoneH, rnd, 24);
  const draw = (type, x, y, s = 1.6) => {
    if (type === 0) cv.path(STAR_PATH, x, y, s * 1.4, { fill: accent, stroke: rgb(0.9, 0.7, 0.2), sw: 0.8 });
    else if (type === 1) cv.path(HEART_PATH, x, y, s * 1.4, { fill: rgb(0.95, 0.55, 0.65) });
    else {
      cv.circle(x, y - 3, 12 * (s / 1.6), { fill: rgb(0.55, 0.75, 0.95) });
      cv.line(x, y + 9, x, y + 22, { w: 1.2, color: C.muted });
    }
  };
  items.forEach((it) => draw(it.type, AREA.x + it.x, AREA.top + it.y));
  const rowTop = AREA.top + zoneH + 36;
  [0, 1, 2].forEach((t) => {
    const x = AREA.x + 40 + t * 150;
    draw(t, x, rowTop + 22, 1.6);
    cv.rect(x + 28, rowTop, 64, 48, { fill: C.white, stroke: C.plum, sw: 2.5, r: 12 });
    if (solution) cv.text(String(counts[t]), x + 60, rowTop + 6, { font: 'title', size: 30, color: C.plum, align: 'center' });
  });
}

function drawName(cv, ctx) {
  const nm = ctx.displayName;
  let size = 64;
  while (cv.width(nm, 'title', size) > AREA.w - 20 && size > 20) size -= 2;
  cv.rect(AREA.x, AREA.top, AREA.w, 120, { fill: C.white, stroke: C.lavender, sw: 2, r: 18 });
  cv.text('Repasse sur les lettres', AREA.x + 16, AREA.top + 10, { font: 'label', size: 10.5, color: C.muted });
  cv.text(nm, PAGE.width / 2, AREA.top + 120 / 2 - size * 0.4, { font: 'title', size, color: C.grey, align: 'center' });
  // Lignes guides
  const guide = (top) => {
    cv.line(AREA.x + 8, top, AREA.x + AREA.w - 8, top, { w: 1.2, color: C.muted });
    cv.line(AREA.x + 8, top + 26, AREA.x + AREA.w - 8, top + 26, { w: 0.8, color: C.lavender, dash: [4, 4] });
    cv.line(AREA.x + 8, top + 52, AREA.x + AREA.w - 8, top + 52, { w: 1.2, color: C.muted });
  };
  cv.text('Écris ton prénom sur les lignes', AREA.x + 8, AREA.top + 140, { font: 'label', size: 10.5, color: C.muted });
  guide(AREA.top + 160);
  guide(AREA.top + 232);
  // Lettres du prénom
  const letters = [...nm.toUpperCase()].filter((ch) => /[A-ZÀ-ÖØ-Þ]/.test(ch));
  const cw = Math.min(46, (AREA.w - 8) / Math.max(letters.length, 1));
  const lx = PAGE.width / 2 - (cw * letters.length) / 2;
  cv.text('Les lettres de ton prénom', AREA.x + 8, AREA.top + 312, { font: 'label', size: 10.5, color: C.muted });
  letters.forEach((ch, i) => {
    cv.rect(lx + i * cw + 2, AREA.top + 332, cw - 4, cw - 4 + 8, { fill: C.white, stroke: C.plum, sw: 1.6, r: 8 });
    cv.text(ch, lx + i * cw + cw / 2, AREA.top + 332 + (cw - 4) / 2 - 6, { font: 'title', size: Math.min(26, cw * 0.6), color: C.plum, align: 'center' });
  });
  cv.text('Dessine-toi !', AREA.x + 8, AREA.top + 400, { font: 'label', size: 10.5, color: C.muted });
  cv.rect(AREA.x, AREA.top + 418, AREA.w, 100, { stroke: C.plum, sw: 1.8, r: 16, fill: C.white });
}

function drawWordSearch(cv, ctx, solution) {
  const size = ctx.band === 'moyens' ? 10 : 14;
  const rnd = P.makeRng(`${ctx.seed}|ws`);
  const themeWords = P.shuffle(ctx.data.words, rnd).slice(0, ctx.band === 'moyens' ? 7 : 10).map(P.toGridWord).filter((w) => w.length <= size);
  const nm = ctx.name.length >= 3 && ctx.name.length <= size ? [ctx.name] : [];
  const ws = P.wordSearch([...nm, ...themeWords], size, rnd, ctx.band === 'moyens' ? P.DIRS_EASY : P.DIRS_ALL);
  const cell = size > 10 ? 26 : 38;
  const gw = cell * size;
  const ox = PAGE.width / 2 - gw / 2;
  const top = AREA.top - 4;
  cv.rect(ox - 6, top - 6, gw + 12, gw + 12, { fill: C.white, stroke: C.lavender, sw: 2, r: 12 });
  if (solution) {
    ws.placed.forEach((p) => {
      const x1 = ox + (p.c + 0.5) * cell; const y1 = top + (p.r + 0.5) * cell;
      const x2 = ox + (p.c + p.dc * (p.word.length - 1) + 0.5) * cell; const y2 = top + (p.r + p.dr * (p.word.length - 1) + 0.5) * cell;
      cv.line(x1, y1, x2, y2, { w: cell * 0.78, color: C.plum, cap: 'round', opacity: 0.3 });
    });
  }
  const fs = cell * 0.56;
  ws.grid.forEach((row, r) => row.forEach((ch, c) => cv.text(ch, ox + (c + 0.5) * cell, top + r * cell + cell / 2 - fs * 0.4, { font: 'label', size: fs, align: 'center' })));
  const words = ws.placed.map((p) => p.word).sort();
  let wy = top + gw + 26;
  cv.text('Mots à retrouver', PAGE.width / 2, wy - 6, { font: 'title', size: 13, color: C.plum, align: 'center' });
  wy += 18;
  const colW = AREA.w / 4;
  words.forEach((w, i) => {
    const col = i % 4; const row = Math.floor(i / 4);
    const isName = w === ctx.name;
    cv.text(w, AREA.x + col * colW + colW / 2, wy + row * 19, { font: isName ? 'title' : 'label', size: 12, color: isName ? C.plum : C.ink, align: 'center' });
  });
}

function drawSudoku(cv, ctx, solution) {
  const n = ctx.band === 'moyens' ? 6 : 9;
  const rnd = P.makeRng(`${ctx.seed}|sudoku`);
  const s = P.sudoku(n, n === 6 ? 18 : 45, rnd);
  const cell = n === 6 ? 62 : 52;
  const gs = cell * n;
  const ox = PAGE.width / 2 - gs / 2;
  const top = AREA.top + 10;
  cv.rect(ox, top, gs, gs, { fill: C.white });
  for (let i = 0; i <= n; i++) {
    const thickV = i % s.bc === 0; const thickH = i % s.br === 0;
    cv.line(ox + i * cell, top, ox + i * cell, top + gs, { w: thickV ? 3 : 0.8, color: thickV ? C.ink : C.muted });
    cv.line(ox, top + i * cell, ox + gs, top + i * cell, { w: thickH ? 3 : 0.8, color: thickH ? C.ink : C.muted });
  }
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const given = s.puzzle[r][c];
    if (given) cv.text(String(given), ox + (c + 0.5) * cell, top + r * cell + cell * 0.22, { font: 'title', size: cell * 0.52, align: 'center' });
    else if (solution) cv.text(String(s.solution[r][c]), ox + (c + 0.5) * cell, top + r * cell + cell * 0.22, { font: 'title', size: cell * 0.52, color: C.plum, align: 'center' });
  }
  const rule = n === 6
    ? 'Place les chiffres de 1 à 6 : une seule fois par ligne, par colonne et par rectangle.'
    : 'Place les chiffres de 1 à 9 : une seule fois par ligne, par colonne et par carré.';
  cv.paragraph(rule, AREA.x + 20, top + gs + 22, AREA.w - 40, { font: 'label', size: 11.5, align: 'center', color: C.muted });
}

// Messages en boîtes de lettres : renvoie la hauteur utilisée.
function layoutLetters(cv, text, top, cellW, drawCell) {
  const words = text.split(' ');
  const per = Math.floor((AREA.w + 8) / (cellW + 3));
  const rows = [[]]; let used = 0;
  words.forEach((w) => {
    const need = w.length + (used ? 1 : 0);
    if (used + need > per) { rows.push([]); used = 0; }
    if (used) { rows[rows.length - 1].push(null); used += 1; }
    rows[rows.length - 1].push(...w.split('')); used += w.length;
  });
  const rowH = cellW * 2 + 26;
  rows.forEach((row, ri) => {
    const rw = row.length * (cellW + 3) - 3;
    let x = PAGE.width / 2 - rw / 2;
    row.forEach((ch) => { if (ch) drawCell(ch, x, top + ri * rowH, cellW); x += cellW + 3; });
  });
  return rows.length * rowH;
}

function drawCode(cv, ctx, solution) {
  const msg = `BRAVO ${ctx.name} ${P.toGridWord(ctx.data.secret).length ? ctx.data.secret : ''}`.trim();
  const msgClean = msg.replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ');
  // Table de correspondance
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const aw = AREA.w / 13;
  alpha.forEach((ch, i) => {
    const col = i % 13; const row = Math.floor(i / 13);
    const x = AREA.x + col * aw; const t = AREA.top - 6 + row * 46;
    cv.rect(x + 2, t, aw - 4, 40, { fill: C.white, stroke: C.lavender, sw: 1.2, r: 6 });
    cv.text(ch, x + aw / 2, t + 4, { font: 'title', size: 15, color: C.plum, align: 'center' });
    cv.text(String(i + 1), x + aw / 2, t + 23, { font: 'label', size: 12, align: 'center' });
  });
  cv.text('Remplace chaque nombre par sa lettre pour lire le message !', PAGE.width / 2, AREA.top + 96, { font: 'label', size: 11, color: C.muted, align: 'center' });
  layoutLetters(cv, msgClean, AREA.top + 124, 26, (ch, x, t, w) => {
    cv.text(String(ch.charCodeAt(0) - 64), x + w / 2, t + 2, { font: 'title', size: 14, color: C.plum, align: 'center' });
    cv.rect(x, t + 26, w, w, { fill: C.white, stroke: C.muted, sw: 1.2, r: 5 });
    if (solution) cv.text(ch, x + w / 2, t + 26 + w * 0.14, { font: 'title', size: w * 0.65, color: C.plum, align: 'center' });
  });
}

function drawArithmetic(cv, ctx, solution) {
  const rnd = P.makeRng(`${ctx.seed}|calc`);
  const ops = P.arithmetic(ctx.age, 12, rnd);
  const colW = AREA.w / 2;
  ops.forEach((o, i) => {
    const col = i % 2; const row = Math.floor(i / 2);
    const x = AREA.x + col * colW; const t = AREA.top + row * 62;
    cv.rect(x + 4, t, colW - 12, 52, { fill: C.white, stroke: C.lavender, sw: 1.6, r: 14 });
    cv.text(`${i + 1}`, x + 18, t + 18, { font: 'label', size: 12, color: C.muted });
    cv.text(`${o.text} =`, x + 44, t + 13, { font: 'title', size: 22 });
    const bx = x + colW - 100;
    cv.line(bx, t + 40, bx + 76, t + 40, { w: 1.6, color: C.muted });
    if (solution) cv.text(String(o.answer), bx + 38, t + 11, { font: 'title', size: 22, color: C.plum, align: 'center' });
  });
  const t = AREA.top + 6 * 62 + 16;
  cv.rect(AREA.x + 80, t, AREA.w - 160, 54, { fill: C.lavender, r: 27 });
  cv.text(solution ? `Score parfait : 12 / 12` : `Mon score :       / 12`, PAGE.width / 2, t + 14, { font: 'title', size: 22, color: C.plum, align: 'center' });
}

function drawCaesar(cv, ctx, solution) {
  const rnd = P.makeRng(`${ctx.seed}|caesar`);
  const shift = 3 + Math.floor(rnd() * 5);
  const plain = `${ctx.name} ${P.toGridWord(ctx.data.secret).length ? ctx.data.secret : ''}`.trim().replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ');
  const coded = P.caesar(plain, shift);
  cv.text(`Clé du code : chaque lettre est décalée de ${shift} rangs dans l’alphabet.`, PAGE.width / 2, AREA.top - 8, { font: 'label', size: 12, color: C.plum, align: 'center' });
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const aw = AREA.w / 13;
  [0, 1].forEach((half) => {
    const t = AREA.top + 16 + half * 76;
    for (let i = 0; i < 13; i++) {
      const idx = half * 13 + i;
      const x = AREA.x + i * aw;
      cv.rect(x + 1.5, t, aw - 3, 28, { fill: C.white, stroke: C.lavender, sw: 1, r: 5 });
      cv.text(alpha[idx], x + aw / 2, t + 5, { font: 'title', size: 14, color: C.ink, align: 'center' });
      cv.rect(x + 1.5, t + 30, aw - 3, 28, { fill: C.lavender, r: 5 });
      cv.text(P.caesar(alpha[idx], shift), x + aw / 2, t + 35, { font: 'title', size: 14, color: C.plum, align: 'center' });
    }
  });
  cv.text('Ligne du haut : lettre vraie · ligne du bas : lettre codée', PAGE.width / 2, AREA.top + 172, { font: 'label', size: 10, color: C.muted, align: 'center' });
  layoutLetters(cv, coded, AREA.top + 204, 26, (ch, x, t, w) => {
    cv.text(ch, x + w / 2, t + 3, { font: 'title', size: 18, color: C.plum, align: 'center' });
    cv.rect(x, t + 26, w, w, { fill: C.white, stroke: C.muted, sw: 1.2, r: 5 });
  });
  // Réponses (solution) rendues dans les cases : second passage
  if (solution) {
    layoutLetters(cv, plain, AREA.top + 204, 26, (ch, x, t, w) => cv.text(ch, x + w / 2, t + 26 + w * 0.14, { font: 'title', size: w * 0.65, color: C.plum, align: 'center' }));
  }
}

function drawAnagrams(cv, ctx, solution) {
  const rnd = P.makeRng(`${ctx.seed}|ana`);
  const words = P.shuffle(ctx.data.words.map(P.toGridWord).filter((w) => w.length >= 4), rnd).slice(0, 9);
  if (ctx.name.length >= 3 && ctx.name.length <= 10) words.push(ctx.name);
  const rowH = 46;
  words.forEach((w, i) => {
    const t = AREA.top - 4 + i * rowH;
    const isName = w === ctx.name;
    const scr = P.scramble(w, P.makeRng(`${ctx.seed}|s${i}`));
    cv.text(`${i + 1}`, AREA.x + 4, t + 10, { font: 'label', size: 13, color: C.muted });
    const cw = 24;
    [...scr].forEach((ch, k) => {
      cv.rect(AREA.x + 28 + k * (cw + 3), t, cw, 34, { fill: isName ? C.blush : C.lavender, r: 7 });
      cv.text(ch, AREA.x + 28 + k * (cw + 3) + cw / 2, t + 6, { font: 'title', size: 18, color: C.plum, align: 'center' });
    });
    const lx = AREA.x + 28 + 10 * (cw + 3) + 16;
    cv.line(lx, t + 30, AREA.x + AREA.w, t + 30, { w: 1.4, color: C.muted });
    if (solution) cv.text(w, lx + 6, t + 6, { font: 'title', size: 18, color: C.plum });
    if (isName) cv.text('bonus : ton prénom', lx + 6, t - 6, { font: 'label', size: 9, color: C.muted });
  });
}

// ---------- Définition des jeux : titre, mission personnalisée, rendu ----------
const RENDERERS = {
  coloriage: { solution: false, mission: (c) => `${c.displayName}, prends tes crayons préférés : ce dessin attend tes plus belles couleurs !`, draw: drawColoring },
  points: { solution: true, mission: (c) => `Relie les points dans l’ordre pour aider ${c.displayName} à découvrir la surprise cachée.`, draw: drawDots },
  labyrinthe: { solution: true, mission: (c) => `Aide ${c.displayName} à traverser le labyrinthe pour rejoindre ${c.data.goal}.`, draw: drawMaze },
  compte: { solution: true, mission: (c) => `${c.displayName} sait bien compter ! Combien y a-t-il d’étoiles, de cœurs et de ballons ?`, draw: drawCount },
  prenom: { solution: false, mission: (c) => `Voici le prénom de ${c.displayName}. Repasse dessus, puis écris-le tout seul !`, draw: drawName },
  motsmeles: { solution: true, mission: (c) => `${c.displayName}, retrouve ton prénom et les mots de l’univers « ${c.data.label} » cachés dans la grille.`, draw: drawWordSearch },
  sudoku: { solution: true, mission: (c) => `Chaque case a son chiffre : ${c.displayName}, à toi de trouver la logique de cette grille !`, draw: drawSudoku },
  code: { solution: true, mission: (c) => `Un message secret est adressé à ${c.displayName}. Utilise la table pour le décoder !`, draw: drawCode },
  calculs: { solution: true, mission: (c) => `${c.displayName} relève le défi : résous les 12 calculs pour gagner son diplôme de calcul mental.`, draw: drawArithmetic },
  cesar: { solution: true, mission: (c) => `Agent ${c.displayName}, un message codé est arrivé à ${c.data.spot.toLowerCase()}. Déchiffre-le avec la clé !`, draw: drawCaesar },
  anagrammes: { solution: true, mission: (c) => `Les lettres se sont mélangées ! ${c.displayName} doit remettre chaque mot de l’univers « ${c.data.label} » en ordre.`, draw: drawAnagrams }
};

const clean = (name) => String(name ?? '').trim().replace(/\s+/g, ' ');

export function validateGameInput({ name, age }) {
  const n = clean(name);
  if (!n) return 'Indique le prénom de l’enfant.';
  if (n.length > 30) return 'Le prénom est trop long (30 caractères maximum).';
  if (!sanitizeName(n)) return 'Le prénom doit contenir au moins une lettre.';
  const a = Number(age);
  if (!Number.isInteger(a) || a < 2 || a > 14) return 'L’âge doit être compris entre 2 et 14 ans.';
  return null;
}

export function pagesFor({ age, gameIds, solution }) {
  const band = bandOf(age);
  const list = gameIds === 'all' || !gameIds ? gamesFor(band) : gameIds.map((id) => findGame(band, id)).filter(Boolean);
  const pages = [];
  list.forEach((g) => pages.push({ game: g, solution: false }));
  if (solution) list.filter((g) => RENDERERS[g.id].solution).forEach((g) => pages.push({ game: g, solution: true }));
  return pages;
}

export async function buildGamesPdf({ name, age, theme = '', gameIds = 'all', variant = 0, solution = false }) {
  const error = validateGameInput({ name, age });
  if (error) throw new Error(error);
  const band = bandOf(age);
  const displayName = clean(name);
  const gridName = sanitizeName(displayName);
  const data = themeData(theme);
  const pages = pagesFor({ age, gameIds, solution });
  if (!pages.length) throw new Error('Aucun jeu sélectionné pour cette tranche d’âge.');

  const doc = await PDFDocument.create();
  doc.setTitle(`Jeux de ${displayName} · Plumio`);
  doc.setAuthor('Plumio');
  doc.setCreator('Plumio');
  const fonts = await loadFonts(doc);

  for (const { game, solution: isSolution } of pages) {
    const page = doc.addPage([PAGE.width, PAGE.height]);
    const cv = new Canvas(page, fonts);
    const r = RENDERERS[game.id];
    const ctx = {
      name: gridName, displayName, age: Number(age), band, data, variant, game,
      seed: `${gridName}|${data.key}|${game.id}|${band}|${variant}`
    };
    frame(cv, ctx, { title: game.title, mission: r.mission(ctx), game, solution: isSolution });
    r.draw(cv, ctx, isSolution);
  }
  return Buffer.from(await doc.save());
}

export { GAMES };
