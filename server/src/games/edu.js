// Jeux éducatifs et d'activité (maths, histoire, géographie, chasse au trésor, bingo, défis, énigmes).
// Les rendus reçoivent les primitives du module de rendu principal pour éviter toute dépendance circulaire.
import { PAGE, sanitize, wrapParagraph } from '../pdf/layout.js';
import * as P from './puzzles.js';
import { addImages, comparePairs, problems, tables } from './edu-math.js';
import { HISTOIRE } from './content/histoire.js';
import { GEO } from './content/geo.js';
import { BINGO, CHASSE, DEFIS, ESCAPE } from './content/activites.js';

const LETTERS = ['A', 'B', 'C'];

/** Choisit `n` éléments en privilégiant le niveau demandé (60 %), complété par les niveaux voisins, puis mélangés. */
export function pickByLevel(list, level, n, rnd) {
  const shuffled = P.shuffle(list, rnd);
  const exact = shuffled.filter((x) => x.level === level);
  const rest = shuffled.filter((x) => x.level !== level).sort((a, b) => Math.abs(a.level - level) - Math.abs(b.level - level));
  const first = exact.slice(0, Math.ceil(n * 0.6));
  const chosen = [...first, ...rest.slice(0, n - first.length)];
  if (chosen.length < n) chosen.push(...exact.slice(first.length, first.length + n - chosen.length));
  return P.shuffle(chosen, rnd).slice(0, n);
}

export function makeEduRenderers({ C, AREA, de, STAR_PATH, HEART_PATH }) {
  const rngOf = (ctx, tag) => P.makeRng(`${ctx.seed}|${tag}|${ctx.level}`);
  const lines = (cv, str, font, size, w) => wrapParagraph(sanitize(str), cv.f[font], size, w).length;
  const fill = (s, ctx) => String(s).replaceAll('{name}', ctx.displayName);
  const checkbox = (cv, x, top, size = 16, ticked = false) => {
    cv.rect(x, top, size, size, { fill: C.white, stroke: C.plum, sw: 1.6, r: 4 });
    if (ticked) {
      cv.line(x + size * 0.22, top + size * 0.55, x + size * 0.42, top + size * 0.78, { w: 2.4, color: C.plum, cap: 'round' });
      cv.line(x + size * 0.42, top + size * 0.78, x + size * 0.8, top + size * 0.22, { w: 2.4, color: C.plum, cap: 'round' });
    }
  };
  const pill = (cv, text, cx, top, w, h = 40, size = 20) => {
    cv.rect(cx - w / 2, top, w, h, { fill: C.lavender, r: h / 2 });
    cv.text(text, cx, top + (h - size) / 2 - 1, { font: 'title', size, color: C.plum, align: 'center' });
  };
  const shape = (cv, kind, x, y, s = 0.75, fillColor = C.plum) =>
    cv.path(kind === 'heart' ? HEART_PATH : STAR_PATH, x, y, s, { fill: fillColor });

  // ---------- Petits : additions en images ----------
  function drawAddImages(cv, ctx, solution) {
    const items = addImages(ctx.level, rngOf(ctx, 'add'), 6);
    const rowH = 76; const sp = 20;
    items.forEach((it, i) => {
      const t = AREA.top + i * rowH; const x0 = AREA.x;
      cv.rect(x0, t, AREA.w, rowH - 8, { fill: C.white, stroke: C.lavender, sw: 1.6, r: 16 });
      const mid = t + (rowH - 8) / 2;
      for (let k = 0; k < it.a; k++) shape(cv, 'star', x0 + 16 + k * sp, mid, 1, C.plum);
      cv.text('+', x0 + 175, mid - 14, { font: 'title', size: 26, color: C.ink, align: 'center' });
      for (let k = 0; k < it.b; k++) shape(cv, 'heart', x0 + 196 + k * sp, mid, 1, C.plum);
      cv.text('=', x0 + 345, mid - 14, { font: 'title', size: 26, color: C.ink, align: 'center' });
      cv.rect(x0 + 362, t + 8, 54, rowH - 24, { fill: C.paper, stroke: C.muted, sw: 1.6, r: 12 });
      if (solution) cv.text(String(it.answer), x0 + 389, mid - 16, { font: 'title', size: 30, color: C.plum, align: 'center' });
    });
    const t = AREA.top + 6 * rowH + 4;
    pill(cv, solution ? 'Score parfait : 6 / 6' : 'Mon score :       / 6', PAGE.width / 2, t, 300);
  }

  // ---------- Petits : plus ou moins ----------
  function drawCompare(cv, ctx, solution) {
    const items = comparePairs(ctx.level, rngOf(ctx, 'cmp'), 6);
    const rowH = 78; const boxW = 200;
    items.forEach((it, i) => {
      const t = AREA.top + i * rowH;
      cv.text(`Entoure le groupe qui en a le ${it.ask === 'plus' ? 'PLUS' : 'MOINS'}`, PAGE.width / 2, t, { font: 'label', size: 12.5, color: C.plum, align: 'center' });
      [['left', it.a, AREA.x + 8, 'star'], ['right', it.b, AREA.x + AREA.w - boxW - 8, 'heart']].forEach(([side, n, bx, kind]) => {
        const good = solution && it.answer === side;
        cv.rect(bx, t + 20, boxW, 44, { fill: C.white, stroke: good ? C.plum : C.lavender, sw: good ? 3.4 : 1.6, r: 14 });
        const per = Math.ceil(n / 2) > 5 ? 5 : Math.min(n, 5);
        for (let k = 0; k < n; k++) {
          const col = k % 5; const row = Math.floor(k / 5);
          const cx = bx + 20 + col * 36; const cy = t + 20 + (n > 5 ? 14 + row * 19 : 22);
          shape(cv, kind, cx, cy, 0.8, C.plum);
        }
        void per;
        if (solution) cv.text(String(n), bx + boxW / 2, t + 66, { font: 'title', size: 13, color: C.muted, align: 'center' });
      });
    });
  }

  // ---------- Moyens : tables ----------
  function drawTables(cv, ctx, solution) {
    const ops = tables(ctx.level, rngOf(ctx, 'tab'), 16);
    const colW = AREA.w / 2; const rowH = 55;
    ops.forEach((o, i) => {
      const col = i % 2; const row = Math.floor(i / 2);
      const x = AREA.x + col * colW; const t = AREA.top + row * rowH;
      cv.rect(x + 4, t, colW - 12, rowH - 8, { fill: C.white, stroke: C.lavender, sw: 1.6, r: 14 });
      cv.text(`${i + 1}`, x + 16, t + 15, { font: 'label', size: 11, color: C.muted });
      cv.text(`${o.text} =`, x + 36, t + 10, { font: 'title', size: 21 });
      const bx = x + colW - 100;
      cv.line(bx, t + 36, bx + 76, t + 36, { w: 1.6, color: C.muted });
      if (solution) {
        cv.text(String(o.answer), bx + 38, t + 8, { font: 'title', size: 21, color: C.plum, align: 'center' });
        cv.text(o.hint, bx + 38, t + 38, { font: 'body', size: 8.5, color: C.muted, align: 'center', maxW: 80 });
      }
    });
    pill(cv, solution ? 'Score parfait : 16 / 16' : 'Mon score :       / 16', PAGE.width / 2, AREA.top + 8 * rowH + 4, 320, 38, 19);
  }

  // ---------- Moyens / grands : problèmes ----------
  function drawProblems(cv, ctx, solution) {
    const list = problems(ctx.band, ctx.level, rngOf(ctx, 'pb'), ctx.displayName, 6);
    const w = AREA.w - 44;
    let size = 12.5;
    const heightOf = (s) => list.reduce((h, p) => h + lines(cv, p.text, 'body', s, w) * s * 1.35 + (solution ? 40 : 38), 0);
    while (heightOf(size) > AREA.h && size > 10) size -= 0.5;
    let t = AREA.top;
    list.forEach((p, i) => {
      cv.circle(AREA.x + 13, t + 11, 12, { fill: C.lavender });
      cv.text(String(i + 1), AREA.x + 13, t + 5, { font: 'title', size: 13, color: C.plum, align: 'center' });
      const h = cv.paragraph(p.text, AREA.x + 36, t, w, { size, leading: 1.35 });
      const ay = t + h + 6;
      cv.text('Réponse :', AREA.x + 36, ay + 4, { font: 'label', size: 11, color: C.muted });
      cv.line(AREA.x + 100, ay + 18, AREA.x + 100 + 150, ay + 18, { w: 1.4, color: C.muted });
      if (solution) {
        cv.text(p.answer, AREA.x + 106, ay + 1, { font: 'title', size: 15, color: C.plum });
        cv.text(`Démarche : ${p.steps}`, AREA.x + 270, ay + 5, { font: 'italic', size: 10, color: C.muted, maxW: AREA.w - 275 });
      }
      t += h + 38;
    });
  }

  // ---------- Histoire et géographie : QCM + vrai/faux ----------
  function planQuiz(cv, ctx, subject) {
    const bank = (subject === 'histoire' ? HISTOIRE : GEO)[ctx.band];
    const rnd = rngOf(ctx, subject);
    const qcm = pickByLevel(bank.quiz, ctx.level, 7, rnd);
    const vf = pickByLevel(bank.vf, ctx.level, 5, rnd);
    const qw = AREA.w - 8; const cw = AREA.w / 3;
    const hQcm = (x) => lines(cv, x.q, 'body', 12.5, qw - 24) * 17 + 8 + Math.max(...x.choices.map((c) => lines(cv, c, 'body', 10.5, cw - 34))) * 12.8 + 14;
    const hVf = (x) => Math.max(lines(cv, x.s, 'body', 12, qw - 130) * 16, 20) + 10;
    const hQcmSol = (x) => 17 + lines(cv, x.why, 'italic', 10.5, qw - 24) * 13 + 7;
    const hVfSol = (x) => Math.max(17, 0) + lines(cv, x.why, 'italic', 10.5, qw - 24) * 13 + 7;
    let nq = 7; let nv = 5;
    const total = () => qcm.slice(0, nq).reduce((s, x) => s + hQcm(x), 0) + vf.slice(0, nv).reduce((s, x) => s + hVf(x), 0) + (nv ? 26 : 0);
    const totalSol = () => qcm.slice(0, nq).reduce((s, x) => s + hQcmSol(x), 0) + vf.slice(0, nv).reduce((s, x) => s + hVfSol(x), 0) + (nv ? 26 : 0);
    while ((total() > AREA.h || totalSol() > AREA.h) && (nv > 2 || nq > 3)) { if (nv > 2) nv--; else nq--; }
    return { qcm: qcm.slice(0, nq), vf: vf.slice(0, nv), hQcm, hVf, qw, cw };
  }

  function drawQuiz(subject) {
    return (cv, ctx, solution) => {
      const { qcm, vf, hQcm, hVf, qw, cw } = planQuiz(cv, ctx, subject);
      let t = AREA.top;
      if (!solution) {
        qcm.forEach((x, i) => {
          cv.text(`${i + 1}.`, AREA.x, t, { font: 'title', size: 13, color: C.plum });
          const h = cv.paragraph(x.q, AREA.x + 24, t, qw - 24, { size: 12.5, leading: 1.36 });
          const cy = t + h + 8;
          let maxL = 1;
          x.choices.forEach((c, k) => {
            const bx = AREA.x + k * cw;
            cv.circle(bx + 8, cy + 8, 7.5, { fill: C.white, stroke: C.plum, sw: 1.5 });
            cv.text(LETTERS[k], bx + 8, cy + 3, { font: 'label', size: 9, color: C.plum, align: 'center' });
            const ch = cv.paragraph(c, bx + 21, cy + 2, cw - 30, { size: 10.5, leading: 1.2 });
            maxL = Math.max(maxL, ch);
          });
          t += hQcm(x);
        });
        if (vf.length) {
          cv.text('Vrai ou faux ?', AREA.x, t + 4, { font: 'title', size: 14, color: C.plum });
          t += 26;
          vf.forEach((x) => {
            const h = cv.paragraph(x.s, AREA.x, t, qw - 130, { size: 12, leading: 1.33 });
            const bx = AREA.x + qw - 112; const by = t + Math.max(h, 20) / 2 - 9;
            [['V', 0], ['F', 56]].forEach(([l, dx]) => {
              cv.circle(bx + dx + 9, by + 9, 9, { fill: C.white, stroke: C.plum, sw: 1.5 });
              cv.text(l, bx + dx + 9, by + 3.5, { font: 'label', size: 11, color: C.plum, align: 'center' });
            });
            t += hVf(x);
          });
        }
        return;
      }
      qcm.forEach((x, i) => {
        cv.text(`${i + 1}.  ${LETTERS[x.answer]} – ${x.choices[x.answer]}`, AREA.x, t, { font: 'title', size: 12.5, color: C.plum, maxW: qw });
        const h = cv.paragraph(x.why, AREA.x + 24, t + 17, qw - 24, { font: 'italic', size: 10.5, leading: 1.24 });
        t += 17 + h + 7;
      });
      if (vf.length) {
        cv.text('Vrai ou faux ?', AREA.x, t + 4, { font: 'title', size: 14, color: C.plum });
        t += 26;
        vf.forEach((x) => {
          cv.text(`${x.answer ? 'VRAI' : 'FAUX'} – ${x.s}`, AREA.x, t, { font: 'title', size: 11.5, color: C.plum, maxW: qw });
          const h = cv.paragraph(x.why, AREA.x + 24, t + 17, qw - 24, { font: 'italic', size: 10.5, leading: 1.24 });
          t += 17 + h + 7;
        });
      }
    };
  }

  // ---------- Relier (géographie) ----------
  function drawMatch(cv, ctx, solution) {
    const rnd = rngOf(ctx, 'pairs');
    const pairs = pickByLevel(GEO[ctx.band].pairs, ctx.level, 8, rnd);
    const order = P.shuffle(pairs.map((_, i) => i), rnd);
    const rowH = 58; const boxW = 150;
    const lx = AREA.x; const rx = AREA.x + AREA.w - boxW;
    pairs.forEach((p, i) => {
      const t = AREA.top + 6 + i * rowH;
      cv.rect(lx, t, boxW, 38, { fill: C.white, stroke: C.lavender, sw: 1.8, r: 12 });
      cv.text(p.a, lx + boxW / 2, t + 11, { font: 'title', size: 14, align: 'center', maxW: boxW - 14 });
      cv.circle(lx + boxW + 12, t + 19, 5, { fill: C.plum });
    });
    order.forEach((idx, j) => {
      const t = AREA.top + 6 + j * rowH;
      cv.rect(rx, t, boxW, 38, { fill: C.white, stroke: C.lavender, sw: 1.8, r: 12 });
      cv.text(pairs[idx].b, rx + boxW / 2, t + 11, { font: 'title', size: 14, align: 'center', maxW: boxW - 14 });
      cv.circle(rx - 12, t + 19, 5, { fill: C.plum });
      if (solution) {
        const t0 = AREA.top + 6 + idx * rowH;
        cv.line(lx + boxW + 12, t0 + 19, rx - 12, t + 19, { w: 2.2, color: C.plum, cap: 'round', opacity: 0.8 });
      }
    });
  }

  // ---------- Frise chronologique (grands) ----------
  function drawTimeline(cv, ctx, solution) {
    const rnd = rngOf(ctx, 'frise');
    const sets = HISTOIRE.grands.frise;
    const best = Math.min(...sets.map((s) => Math.abs(s.level - ctx.level)));
    const pool = sets.filter((s) => Math.abs(s.level - ctx.level) === best);
    const set = pool[Math.floor(rnd() * pool.length)];
    const sorted = [...set.events].sort((a, b) => a.year - b.year);
    const shuffled = P.shuffle(set.events, rnd);
    const rowH = 50;
    cv.text(set.title, PAGE.width / 2, AREA.top - 8, { font: 'title', size: 15, color: C.plum, align: 'center', maxW: AREA.w });
    shuffled.forEach((e, i) => {
      const t = AREA.top + 20 + i * rowH;
      cv.rect(AREA.x, t, 36, 36, { fill: C.white, stroke: C.plum, sw: 2, r: 10 });
      if (solution) cv.text(String(sorted.indexOf(e) + 1), AREA.x + 18, t + 7, { font: 'title', size: 20, color: C.plum, align: 'center' });
      cv.text(`${LETTERS.concat(['D', 'E', 'F'])[i]}.`, AREA.x + 50, t + 10, { font: 'title', size: 13, color: C.muted });
      cv.paragraph(e.label, AREA.x + 72, t + (lines(cv, e.label, 'body', 12.5, AREA.w - 80) > 1 ? 2 : 10), AREA.w - 80, { size: 12.5, leading: 1.3 });
    });
    const top2 = AREA.top + 20 + 6 * rowH + 14;
    if (!solution) {
      cv.text('Écris 1 pour le plus ancien, jusqu’à 6 pour le plus récent.', PAGE.width / 2, top2, { font: 'italic', size: 11.5, color: C.muted, align: 'center' });
      cv.line(AREA.x + 10, top2 + 44, AREA.x + AREA.w - 22, top2 + 44, { w: 2.4, color: C.plum, cap: 'round' });
      cv.path('M 0 -7 L 14 0 L 0 7 Z', AREA.x + AREA.w - 22, top2 + 44, 1, { fill: C.plum });
      for (let k = 0; k < 6; k++) cv.rect(AREA.x + 10 + k * ((AREA.w - 70) / 5), top2 + 31, 26, 26, { fill: C.white, stroke: C.muted, sw: 1.4, r: 7 });
      return;
    }
    cv.text('Dans l’ordre :', AREA.x, top2 - 4, { font: 'title', size: 13, color: C.plum });
    sorted.forEach((e, i) => {
      const t = top2 + 16 + i * 17;
      cv.text(`${i + 1}. ${e.date}`, AREA.x, t, { font: 'title', size: 11.5, color: C.plum });
      cv.text(e.label, AREA.x + 130, t, { font: 'body', size: 11, maxW: AREA.w - 134 });
    });
  }

  // ---------- Chasse au trésor ----------
  function drawHunt(cv, ctx) {
    const rnd = rngOf(ctx, 'hunt');
    const pack = CHASSE[ctx.band];
    const nTheme = ctx.band === 'petits' ? 4 : 6; const nGen = ctx.band === 'petits' ? 4 : 6;
    const themed = P.shuffle(pack.themed[ctx.data.key] || [], rnd).slice(0, nTheme);
    const generic = P.shuffle(pack.generic, rnd).slice(0, nGen + (nTheme - themed.length));
    const all = P.shuffle([...themed, ...generic], rnd).map((s) => fill(s, ctx));
    const w = AREA.w - 52; let size = ctx.band === 'petits' ? 14 : 12.5;
    const gap = ctx.band === 'petits' ? 20 : 9;
    const heightOf = (s) => all.reduce((h, m) => h + Math.max(lines(cv, m, 'body', s, w) * s * 1.35, 24) + gap, 0);
    while (heightOf(size) > AREA.h - 52 && size > 10) size -= 0.5;
    let t = AREA.top;
    all.forEach((m) => {
      const h = Math.max(lines(cv, m, 'body', size, w) * size * 1.35, 24);
      checkbox(cv, AREA.x + 4, t + h / 2 - 11, 22);
      cv.paragraph(m, AREA.x + 40, t + (h - lines(cv, m, 'body', size, w) * size * 1.35) / 2, w, { size, leading: 1.35 });
      t += h + gap;
    });
    pill(cv, `Missions réussies :       / ${all.length}`, PAGE.width / 2, Math.min(t + 6, AREA.top + AREA.h - 38), 360, 38, 18);
  }

  // ---------- Bingo ----------
  function drawBingo(cv, ctx) {
    const rnd = rngOf(ctx, 'bingo');
    const n = ctx.band === 'petits' ? 3 : 5;
    const items = P.shuffle(BINGO[ctx.band], rnd).slice(0, n * n - 1).map((s) => fill(s, ctx));
    const cell = Math.min(AREA.w / n, ctx.band === 'petits' ? 140 : 84);
    const ox = PAGE.width / 2 - (cell * n) / 2;
    const size = ctx.band === 'petits' ? 14 : 10.5;
    const center = (n * n - 1) / 2;
    let k = 0;
    for (let i = 0; i < n * n; i++) {
      const x = ox + (i % n) * cell; const t = AREA.top + Math.floor(i / n) * cell;
      const free = i === center;
      cv.rect(x + 2, t + 2, cell - 4, cell - 4, { fill: free ? C.lavender : C.white, stroke: free ? C.plum : C.lavender, sw: 1.8, r: 12 });
      if (free) {
        cv.path(STAR_PATH, x + cell / 2, t + cell / 2 - 6, cell / 38, { fill: C.plum });
        cv.text('LIBRE', x + cell / 2, t + cell / 2 + cell * 0.2, { font: 'label', size: size, color: C.plum, align: 'center' });
        continue;
      }
      const text = items[k++];
      const h = lines(cv, text, 'body', size, cell - 16) * size * 1.2;
      cv.paragraph(text, x + 8, t + (cell - h) / 2 + 2, cell - 16, { size, leading: 1.2, align: 'center' });
    }
    cv.paragraph('Pars en balade : colorie chaque case dès que tu trouves la chose. Une ligne complète, c’est BINGO !', AREA.x, AREA.top + n * cell + 14, AREA.w, { font: 'italic', size: 12, align: 'center', color: C.muted });
  }

  // ---------- Défis ----------
  function drawChallenges(cv, ctx) {
    const rnd = rngOf(ctx, 'defis');
    const count = ctx.band === 'petits' ? 8 : 12;
    const cards = P.shuffle(DEFIS[ctx.band], rnd).slice(0, count).map((s) => fill(s, ctx));
    const rows = count / 2; const gap = 8;
    const cardH = Math.min(86, (AREA.h - (rows - 1) * gap) / rows); const cardW = (AREA.w - 12) / 2;
    cards.forEach((txt, i) => {
      const x = AREA.x + (i % 2) * (cardW + 12); const t = AREA.top + Math.floor(i / 2) * (cardH + gap);
      cv.rect(x, t, cardW, cardH, { fill: C.white, stroke: C.lavender, sw: 1.8, r: 14 });
      cv.circle(x + 18, t + 18, 11, { fill: C.lavender });
      cv.text(String(i + 1), x + 18, t + 12.5, { font: 'title', size: 12, color: C.plum, align: 'center' });
      let size = ctx.band === 'petits' ? 12.5 : 11;
      const w = cardW - 74;
      while (lines(cv, txt, 'body', size, w) * size * 1.3 > cardH - 18 && size > 8.5) size -= 0.5;
      cv.paragraph(txt, x + 38, t + 10, w, { size, leading: 1.3 });
      checkbox(cv, x + cardW - 28, t + cardH / 2 - 9, 18);
    });
  }

  // ---------- Énigmes (escape game papier) ----------
  function pickEscape(ctx) {
    const list = ESCAPE[ctx.band];
    const best = Math.min(...list.map((s) => Math.abs(s.level - ctx.level)));
    const pool = list.filter((s) => Math.abs(s.level - ctx.level) === best);
    return pool[Math.floor(rngOf(ctx, 'escape')() * pool.length)];
  }

  function drawEscape(cv, ctx, solution) {
    const sc = pickEscape(ctx);
    cv.text(fill(sc.title, ctx), PAGE.width / 2, AREA.top - 10, { font: 'title', size: 16, color: C.plum, align: 'center', maxW: AREA.w });
    let size = 11.5;
    const w = AREA.w - 44;
    const intro = fill(sc.intro, ctx);
    const total = (s) => lines(cv, intro, 'italic', s, AREA.w) * s * 1.35 + 10 + sc.riddles.reduce((h, r) => h + lines(cv, r.text, 'body', s, w) * s * 1.35 + (solution ? 16 : 0) + 38, 0) + 56;
    while (total(size) > AREA.h - 14 && size > 9.5) size -= 0.5;
    let t = AREA.top + 12;
    t += cv.paragraph(intro, AREA.x, t, AREA.w, { font: 'italic', size, leading: 1.35, color: C.muted }) + 10;
    sc.riddles.forEach((r, i) => {
      cv.circle(AREA.x + 13, t + 11, 12, { fill: C.lavender });
      cv.text(String(i + 1), AREA.x + 13, t + 5, { font: 'title', size: 13, color: C.plum, align: 'center' });
      const h = cv.paragraph(fill(r.text, ctx), AREA.x + 36, t, w, { size, leading: 1.35 });
      const by = t + h + 6;
      [...r.answer].forEach((ch, k) => {
        const bx = AREA.x + 36 + k * 24;
        cv.rect(bx, by, 21, 24, { fill: k === 0 ? C.blush : C.white, stroke: C.muted, sw: 1.3, r: 5 });
        if (solution) cv.text(ch, bx + 10.5, by + 4, { font: 'title', size: 15, color: C.plum, align: 'center' });
      });
      let th = 38;
      if (solution) {
        const hh = cv.paragraph(r.why, AREA.x + 36 + r.answer.length * 24 + 12, by + 2, AREA.w - (r.answer.length * 24 + 56), { font: 'italic', size: Math.min(size, 10.5), leading: 1.25, color: C.muted });
        th = Math.max(th, 38 + Math.max(0, hh - 22));
      }
      t += h + th;
    });
    cv.text('Code du coffre :', AREA.x, t + 14, { font: 'title', size: 14, color: C.plum });
    for (let k = 0; k < 5; k++) {
      const bx = AREA.x + 138 + k * 40;
      cv.rect(bx, t + 6, 34, 36, { fill: C.white, stroke: C.plum, sw: 2.2, r: 8 });
      if (solution) cv.text(sc.code[k], bx + 17, t + 12, { font: 'title', size: 22, color: C.plum, align: 'center' });
    }
    if (!solution) cv.text('Recopie la 1re lettre (case rose) de chaque réponse.', AREA.x + 345, t + 17, { font: 'italic', size: 9.5, color: C.muted, maxW: AREA.x + AREA.w - (AREA.x + 345) });
  }

  const adaptive = (extra) => ({ level: true, ...extra });
  return {
    addimages: adaptive({ solution: true, mission: (c) => `${c.displayName} compte les étoiles et les cœurs : combien y en a-t-il en tout ?`, draw: drawAddImages }),
    comparer: adaptive({ solution: true, mission: (c) => `${c.displayName} est un as des comparaisons : quel groupe en a le plus, quel groupe en a le moins ?`, draw: drawCompare }),
    tables: adaptive({ solution: true, mission: (c) => `${c.displayName} s’entraîne à ses tables de multiplication : 16 calculs pour devenir un champion !`, draw: drawTables }),
    problemes: adaptive({ solution: true, mission: (c) => `Six petits problèmes à résoudre pour ${c.displayName}. Lis bien chaque histoire avant de calculer !`, draw: drawProblems }),
    maths: adaptive({ solution: true, mission: (c) => `${c.displayName} relève six défis de maths : réfléchis, pose l’opération et vérifie ton résultat.`, draw: drawProblems }),
    histoire: adaptive({ solution: true, mission: (c) => `Voyage dans le temps avec ${c.displayName} : choisis la bonne réponse et dis si chaque affirmation est vraie ou fausse.`, draw: drawQuiz('histoire') }),
    geo: adaptive({ solution: true, mission: (c) => `Tour du monde ${de(c.displayName)} : une question, trois réponses… une seule est la bonne !`, draw: drawQuiz('geo') }),
    relier: adaptive({ solution: true, mission: (c) => `${c.displayName} relie chaque mot de gauche à son partenaire de droite, sans se tromper.`, draw: drawMatch }),
    frise: adaptive({ solution: true, mission: (c) => `Remets les événements dans l’ordre du temps, du plus ancien au plus récent, comme un vrai historien : ${c.displayName} en est capable !`, draw: drawTimeline }),
    chasse: { solution: false, mission: (c) => `Chasse au trésor ${de(c.displayName)} ! Un adulte te lit les missions. Coche chaque case réussie dans l’univers « ${c.data.label} ».`, draw: drawHunt },
    bingo: { solution: false, mission: (c) => `Bingo ${de(c.displayName)} : pars à la recherche de ces trésors du quotidien, dehors ou à la maison.`, draw: drawBingo },
    defis: { solution: false, mission: (c) => `${c.displayName}, voici ${c.band === 'petits' ? 8 : 12} défis rigolos ! Relève-les en famille et coche chaque défi réussi.`, draw: drawChallenges },
    escape: adaptive({ solution: true, mission: (c) => `Escape game pour ${c.displayName} : résous les cinq énigmes pour trouver le code qui ouvre le coffre.`, draw: drawEscape })
  };
}
