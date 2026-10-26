// Illustrations vectorielles de secours (dessinées avec pdf-lib) utilisées quand aucune image IA n'est disponible.
// Chaque thème a sa scène ; la graine fait varier la composition d'une page à l'autre.
import { rgb } from 'pdf-lib';
import { PAGE } from './layout.js';

export function themeKey(theme = '') {
  const t = theme.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('espace')) return 'space';
  if (t.includes('foret')) return 'forest';
  if (t.includes('pirate')) return 'pirates';
  if (t.includes('heros') || t.includes('hero')) return 'heroes';
  if (t.includes('licorne')) return 'unicorns';
  if (t.includes('dino')) return 'dinos';
  if (t.includes('ocean') || t.includes('mer')) return 'ocean';
  if (t.includes('chevalier') || t.includes('dragon')) return 'knights';
  if (t.includes('robot')) return 'robots';
  if (t.includes('cirque')) return 'circus';
  if (t.includes('mystere') || t.includes('detective')) return 'mystery';
  if (t.includes('fee') || t.includes('lutin')) return 'fairies';
  if (t.includes('banquise') || t.includes('polaire')) return 'polar';
  if (t.includes('sport') || t.includes('champion')) return 'sports';
  if (t.includes('patisserie') || t.includes('cuisine')) return 'bakery';
  if (t.includes('savane') || t.includes('safari')) return 'safari';
  return 'forest';
}

export const PALETTES = {
  space: { top: [0.16, 0.14, 0.38], bottom: [0.55, 0.42, 0.78], accent: [0.98, 0.85, 0.5] },
  forest: { top: [0.78, 0.9, 0.9], bottom: [0.86, 0.95, 0.78], accent: [0.99, 0.9, 0.6] },
  pirates: { top: [1, 0.86, 0.78], bottom: [0.7, 0.85, 0.95], accent: [0.99, 0.78, 0.45] },
  heroes: { top: [0.99, 0.72, 0.68], bottom: [0.6, 0.62, 0.9], accent: [0.99, 0.88, 0.45] },
  unicorns: { top: [0.84, 0.8, 0.97], bottom: [0.99, 0.84, 0.9], accent: [1, 0.92, 0.7] },
  dinos: { top: [0.99, 0.88, 0.7], bottom: [0.72, 0.88, 0.7], accent: [0.99, 0.78, 0.4] },
  ocean: { top: [0.62, 0.85, 0.95], bottom: [0.2, 0.42, 0.7], accent: [0.99, 0.9, 0.7] },
  knights: { top: [0.75, 0.82, 0.97], bottom: [0.82, 0.9, 0.78], accent: [0.99, 0.85, 0.45] },
  robots: { top: [0.82, 0.9, 0.98], bottom: [0.75, 0.82, 0.95], accent: [0.99, 0.82, 0.45] },
  circus: { top: [0.99, 0.8, 0.82], bottom: [0.99, 0.92, 0.75], accent: [0.99, 0.85, 0.4] },
  mystery: { top: [0.22, 0.24, 0.45], bottom: [0.5, 0.45, 0.7], accent: [0.99, 0.88, 0.5] },
  fairies: { top: [0.85, 0.8, 0.97], bottom: [0.75, 0.9, 0.85], accent: [1, 0.9, 0.6] },
  polar: { top: [0.18, 0.28, 0.5], bottom: [0.75, 0.88, 0.97], accent: [0.7, 0.98, 0.85] },
  sports: { top: [0.7, 0.86, 0.98], bottom: [0.85, 0.95, 0.8], accent: [0.99, 0.85, 0.4] },
  bakery: { top: [1, 0.9, 0.85], bottom: [0.99, 0.95, 0.8], accent: [1, 0.75, 0.6] },
  safari: { top: [0.99, 0.8, 0.55], bottom: [0.95, 0.88, 0.6], accent: [1, 0.93, 0.7] }
};

function makeRng(seed) {
  let s = (seed * 2654435761 + 12345) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const col = (c) => rgb(c[0], c[1], c[2]);

export function drawScene(page, box, theme, seed = 0) {
  const key = themeKey(theme);
  const pal = PALETTES[key];
  const rnd = makeRng(seed + 7);
  const X = (u) => box.x + u * box.width;
  const Y = (v) => box.y + v * box.height;
  const S = Math.min(box.width, box.height);

  const poly = (pts, color, opacity = 1) => {
    const d = pts.map(([u, v], i) => `${i ? 'L' : 'M'} ${X(u).toFixed(2)} ${(PAGE.height - Y(v)).toFixed(2)}`).join(' ') + ' Z';
    page.drawSvgPath(d, { x: 0, y: PAGE.height, color: col(color), opacity, borderWidth: 0 });
  };
  const circle = (u, v, r, color, opacity = 1) =>
    page.drawCircle({ x: X(u), y: Y(v), size: r * S, color: col(color), opacity });
  const ellipse = (u, v, rx, ry, color, opacity = 1) =>
    page.drawEllipse({ x: X(u), y: Y(v), xScale: rx * S, yScale: ry * S, color: col(color), opacity });
  const hill = (baseV, amp, color, phase) => {
    const pts = [[0, 0]];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      pts.push([u, baseV + amp * Math.sin(u * 5 + phase) * 0.5 + amp * 0.5]);
    }
    pts.push([1, 0]);
    poly(pts, color);
  };
  const star = (u, v, r, color, opacity = 1) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.45 : r;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push([u + (Math.cos(a) * rad * S) / box.width, v - (Math.sin(a) * rad * S) / box.height]);
    }
    poly(pts, color, opacity);
  };

  // Fond en dégradé vertical
  const bands = 40;
  for (let i = 0; i < bands; i++) {
    const c = mix(pal.top, pal.bottom, i / (bands - 1));
    page.drawRectangle({
      x: box.x, y: box.y + box.height - ((i + 1) * box.height) / bands - 0.5,
      width: box.width, height: box.height / bands + 1, color: col(c)
    });
  }

  const white = [1, 1, 1];

  if (key === 'space') {
    for (let i = 0; i < 46; i++) star(rnd(), 0.35 + rnd() * 0.65, 0.006 + rnd() * 0.012, white, 0.5 + rnd() * 0.5);
    const px = 0.2 + rnd() * 0.5;
    ellipse(px, 0.62, 0.3, 0.06, [0.99, 0.88, 0.55], 0.85);
    circle(px, 0.62, 0.17, [0.95, 0.62, 0.62]);
    circle(px - 0.04, 0.66, 0.04, [0.98, 0.76, 0.74], 0.8);
    circle(0.84 - rnd() * 0.1, 0.84, 0.07, [0.98, 0.96, 0.88]);
    circle(0.82 - rnd() * 0.1, 0.86, 0.015, [0.88, 0.85, 0.78]);
    const rx = 0.55 + rnd() * 0.25;
    poly([[rx - 0.05, 0.12], [rx - 0.05, 0.3], [rx, 0.42], [rx + 0.05, 0.3], [rx + 0.05, 0.12]], [0.97, 0.97, 1]);
    poly([[rx - 0.05, 0.12], [rx - 0.1, 0.06], [rx - 0.05, 0.2]], [0.93, 0.45, 0.5]);
    poly([[rx + 0.05, 0.12], [rx + 0.1, 0.06], [rx + 0.05, 0.2]], [0.93, 0.45, 0.5]);
    circle(rx, 0.27, 0.025, [0.55, 0.75, 0.95]);
    poly([[rx - 0.03, 0.12], [rx, 0.02], [rx + 0.03, 0.12]], pal.accent, 0.9);
    hill(0.02, 0.1, [0.32, 0.26, 0.55], rnd() * 3);
  } else if (key === 'forest') {
    circle(0.8, 0.82, 0.09, pal.accent, 0.9);
    hill(0.18, 0.12, [0.65, 0.84, 0.72], rnd() * 3);
    const tree = (u, base, h, shade) => {
      poly([[u - 0.012, base], [u - 0.012, base + h * 0.25], [u + 0.012, base + h * 0.25], [u + 0.012, base]], [0.55, 0.42, 0.36]);
      for (let k = 0; k < 3; k++) {
        const w = 0.07 * (1 - k * 0.22) * (h / 0.35) * 0.9;
        const b = base + h * 0.2 + k * h * 0.22;
        poly([[u - w, b], [u, b + h * 0.38], [u + w, b]], mix([0.36, 0.66, 0.52], [0.2, 0.5, 0.45], shade + k * 0.15));
      }
    };
    for (let i = 0; i < 6; i++) tree(0.08 + i * 0.17 + rnd() * 0.05, 0.16 + rnd() * 0.12, 0.28 + rnd() * 0.14, rnd() * 0.5);
    hill(0.0, 0.1, [0.45, 0.72, 0.58], rnd() * 3 + 2);
    const mx = 0.2 + rnd() * 0.6;
    poly([[mx - 0.012, 0.03], [mx - 0.012, 0.09], [mx + 0.012, 0.09], [mx + 0.012, 0.03]], [0.97, 0.94, 0.88]);
    ellipse(mx, 0.1, 0.055, 0.035, [0.93, 0.5, 0.6]);
    circle(mx - 0.02, 0.105, 0.008, white);
    circle(mx + 0.02, 0.11, 0.008, white);
    for (let i = 0; i < 16; i++) circle(rnd(), 0.2 + rnd() * 0.6, 0.006, pal.accent, 0.9);
  } else if (key === 'pirates') {
    circle(0.18 + rnd() * 0.1, 0.8, 0.1, pal.accent, 0.95);
    ellipse(0.7, 0.85, 0.12, 0.03, white, 0.85);
    ellipse(0.3, 0.7, 0.09, 0.025, white, 0.85);
    const sea = [0.38, 0.65, 0.85];
    page.drawRectangle({ x: box.x, y: box.y, width: box.width, height: box.height * 0.38, color: col(sea) });
    const sx = 0.38 + rnd() * 0.2;
    poly([[sx - 0.2, 0.3], [sx + 0.2, 0.3], [sx + 0.14, 0.18], [sx - 0.14, 0.18]], [0.62, 0.42, 0.34]);
    poly([[sx - 0.005, 0.3], [sx - 0.005, 0.78], [sx + 0.005, 0.78], [sx + 0.005, 0.3]], [0.45, 0.32, 0.28]);
    poly([[sx + 0.02, 0.34], [sx + 0.02, 0.74], [sx + 0.17, 0.4]], [0.99, 0.97, 0.92]);
    poly([[sx - 0.02, 0.36], [sx - 0.02, 0.7], [sx - 0.14, 0.4]], [0.99, 0.93, 0.86]);
    poly([[sx, 0.78], [sx, 0.86], [sx + 0.09, 0.82]], [0.9, 0.38, 0.45]);
    for (let r = 0; r < 4; r++) for (let i = 0; i < 7; i++) {
      ellipse(((i + (r % 2) * 0.5) / 6.5) + rnd() * 0.02, 0.04 + r * 0.075, 0.07, 0.012, [0.75, 0.9, 0.98], 0.8);
    }
  } else if (key === 'heroes') {
    circle(0.5, 0.52, 0.2, pal.accent, 0.9);
    for (let i = 0; i < 14; i++) {
      const a = (Math.PI * 2 * i) / 14;
      poly([
        [0.5 + Math.cos(a) * 0.22 * S / box.width, 0.52 + Math.sin(a) * 0.22 * S / box.height],
        [0.5 + Math.cos(a + 0.12) * 0.4 * S / box.width, 0.52 + Math.sin(a + 0.12) * 0.4 * S / box.height],
        [0.5 + Math.cos(a - 0.12) * 0.4 * S / box.width, 0.52 + Math.sin(a - 0.12) * 0.4 * S / box.height]
      ], pal.accent, 0.35);
    }
    let u = 0;
    while (u < 1) {
      const w = 0.06 + rnd() * 0.07;
      const h = 0.14 + rnd() * 0.28;
      poly([[u, 0], [u, h], [u + w, h], [u + w, 0]], mix([0.42, 0.42, 0.7], [0.3, 0.3, 0.58], rnd()));
      for (let k = 0; k < 3; k++) page.drawRectangle({
        x: X(u + w * 0.25), y: Y(h - 0.04 - k * 0.07), width: S * 0.012, height: S * 0.02, color: col(pal.accent), opacity: 0.8
      });
      u += w + 0.004;
    }
    const fx = 0.3 + rnd() * 0.4;
    poly([[fx - 0.07, 0.5], [fx + 0.02, 0.62], [fx + 0.03, 0.55], [fx - 0.02, 0.45]], [0.9, 0.3, 0.4]);
    circle(fx + 0.04, 0.6, 0.035, [0.99, 0.84, 0.72]);
    poly([[fx, 0.52], [fx + 0.06, 0.6], [fx + 0.09, 0.56], [fx + 0.03, 0.48]], [0.3, 0.45, 0.85]);
    star(fx + 0.05, 0.56, 0.018, pal.accent);
  } else if (key === 'unicorns') {
    const rainbow = [[0.96, 0.5, 0.55], [0.99, 0.75, 0.45], [0.99, 0.93, 0.55], [0.6, 0.85, 0.6], [0.5, 0.75, 0.95], [0.75, 0.6, 0.95]];
    const cx = 0.3 + rnd() * 0.4;
    rainbow.forEach((c, i) => {
      page.drawCircle({ x: X(cx), y: Y(0.12), size: (0.5 - i * 0.045) * S, color: col(c) });
    });
    page.drawCircle({ x: X(cx), y: Y(0.12), size: 0.22 * S, color: col(mix(pal.top, pal.bottom, 0.6)) });
    for (let i = 0; i < 3; i++) {
      const u0 = 0.1 + i * 0.32 + rnd() * 0.1;
      const v0 = 0.7 + rnd() * 0.2;
      ellipse(u0, v0, 0.09, 0.03, white, 0.9);
      ellipse(u0 + 0.05, v0 + 0.02, 0.06, 0.03, white, 0.9);
      ellipse(u0 - 0.05, v0 + 0.01, 0.055, 0.025, white, 0.9);
    }
    hill(0.06, 0.1, [0.78, 0.88, 0.78], rnd() * 3);
    for (let i = 0; i < 12; i++) star(rnd(), 0.3 + rnd() * 0.6, 0.012 + rnd() * 0.01, pal.accent, 0.9);
    const ux = 0.55 + rnd() * 0.2;
    ellipse(ux, 0.24, 0.1, 0.055, white);
    poly([[ux + 0.06, 0.26], [ux + 0.1, 0.4], [ux + 0.14, 0.36], [ux + 0.1, 0.24]], white);
    ellipse(ux + 0.12, 0.39, 0.035, 0.028, white);
    poly([[ux + 0.125, 0.4], [ux + 0.135, 0.5], [ux + 0.145, 0.4]], pal.accent);
    for (const dx of [-0.06, -0.02, 0.03, 0.07]) poly([[ux + dx, 0.22], [ux + dx, 0.1], [ux + dx + 0.015, 0.1], [ux + dx + 0.015, 0.22]], [0.96, 0.95, 0.99]);
    poly([[ux - 0.08, 0.27], [ux - 0.16, 0.22], [ux - 0.12, 0.17], [ux - 0.07, 0.22]], [0.95, 0.6, 0.78]);
  } else if (key === 'dinos') {
    circle(0.8, 0.8, 0.09, pal.accent, 0.95);
    // volcan
    const vx = 0.22 + rnd() * 0.15;
    poly([[vx - 0.22, 0.1], [vx - 0.04, 0.5], [vx + 0.04, 0.5], [vx + 0.22, 0.1]], [0.55, 0.4, 0.38]);
    poly([[vx - 0.04, 0.5], [vx, 0.46], [vx + 0.04, 0.5]], [0.95, 0.45, 0.3]);
    ellipse(vx, 0.58, 0.05, 0.035, [0.85, 0.82, 0.8], 0.7);
    ellipse(vx + 0.05, 0.66, 0.06, 0.04, [0.88, 0.85, 0.83], 0.6);
    hill(0.1, 0.1, [0.62, 0.8, 0.52], rnd() * 3);
    // fougères
    for (let i = 0; i < 5; i++) {
      const fx = 0.05 + i * 0.22 + rnd() * 0.06;
      for (let k = 0; k < 5; k++) {
        const a = -0.9 + k * 0.45;
        poly([[fx, 0.04], [fx + Math.sin(a) * 0.14, 0.04 + Math.cos(a) * 0.2], [fx + Math.sin(a) * 0.14 + 0.015, 0.04 + Math.cos(a) * 0.2 - 0.02]], [0.3, 0.6, 0.38]);
      }
    }
    // diplodocus
    const dx = 0.5 + rnd() * 0.2;
    ellipse(dx, 0.22, 0.12, 0.065, [0.55, 0.75, 0.5]);
    poly([[dx - 0.1, 0.24], [dx - 0.2, 0.2], [dx - 0.1, 0.2]], [0.55, 0.75, 0.5]);
    poly([[dx + 0.07, 0.25], [dx + 0.11, 0.55], [dx + 0.135, 0.55], [dx + 0.115, 0.25]], [0.55, 0.75, 0.5]);
    ellipse(dx + 0.14, 0.56, 0.035, 0.022, [0.55, 0.75, 0.5]);
    circle(dx + 0.15, 0.565, 0.006, [0.2, 0.25, 0.2]);
    for (const o of [-0.07, -0.02, 0.04, 0.09]) poly([[dx + o, 0.2], [dx + o, 0.08], [dx + o + 0.02, 0.08], [dx + o + 0.02, 0.2]], [0.45, 0.66, 0.42]);
  } else if (key === 'ocean') {
    circle(0.8, 0.88, 0.08, pal.accent, 0.8);
    for (let i = 0; i < 5; i++) {
      const rx = 0.1 + i * 0.2;
      page.drawRectangle({ x: X(rx), y: Y(0.55 + rnd() * 0.2), width: S * 0.004, height: S * 0.5, color: col([0.9, 0.97, 1]), opacity: 0.25 });
    }
    // bulles
    for (let i = 0; i < 20; i++) circle(rnd(), 0.15 + rnd() * 0.8, 0.008 + rnd() * 0.02, [1, 1, 1], 0.35);
    // sable + corail
    hill(0.0, 0.08, [0.93, 0.85, 0.65], rnd() * 3);
    const coral = (u, h, c) => {
      poly([[u - 0.01, 0.04], [u - 0.01, 0.04 + h], [u + 0.01, 0.04 + h], [u + 0.01, 0.04]], c);
      poly([[u, 0.04 + h * 0.4], [u + 0.07, 0.04 + h * 0.8], [u + 0.08, 0.04 + h * 0.7], [u + 0.015, 0.04 + h * 0.3]], c);
      poly([[u, 0.04 + h * 0.5], [u - 0.07, 0.04 + h * 0.85], [u - 0.08, 0.04 + h * 0.75], [u - 0.015, 0.04 + h * 0.4]], c);
    };
    coral(0.12, 0.28, [0.96, 0.5, 0.55]);
    coral(0.82, 0.3, [0.98, 0.65, 0.4]);
    coral(0.6, 0.18, [0.85, 0.55, 0.85]);
    // poisson
    const fx = 0.3 + rnd() * 0.3;
    const fy = 0.45 + rnd() * 0.2;
    ellipse(fx, fy, 0.09, 0.05, [0.99, 0.72, 0.35]);
    poly([[fx - 0.08, fy], [fx - 0.15, fy + 0.05], [fx - 0.15, fy - 0.05]], [0.99, 0.72, 0.35]);
    circle(fx + 0.05, fy + 0.01, 0.01, [0.2, 0.25, 0.4]);
    poly([[fx - 0.01, fy + 0.045], [fx + 0.02, fy + 0.09], [fx + 0.04, fy + 0.04]], [0.96, 0.5, 0.4]);
    // petite perle
    circle(0.5 + rnd() * 0.15, 0.1, 0.022, [1, 0.97, 0.92]);
  } else if (key === 'knights') {
    circle(0.82, 0.82, 0.08, pal.accent, 0.95);
    ellipse(0.25, 0.8, 0.1, 0.03, white, 0.85);
    hill(0.2, 0.12, [0.66, 0.84, 0.66], rnd() * 3);
    // château
    const cx = 0.3 + rnd() * 0.3;
    const stone = [0.78, 0.76, 0.82];
    poly([[cx - 0.2, 0.18], [cx - 0.2, 0.46], [cx + 0.2, 0.46], [cx + 0.2, 0.18]], stone);
    for (const t of [-0.2, 0.2]) {
      poly([[cx + t - 0.05, 0.18], [cx + t - 0.05, 0.62], [cx + t + 0.05, 0.62], [cx + t + 0.05, 0.18]], [0.7, 0.68, 0.76]);
      poly([[cx + t - 0.065, 0.62], [cx + t, 0.76], [cx + t + 0.065, 0.62]], [0.86, 0.4, 0.5]);
    }
    for (let i = 0; i < 5; i++) page.drawRectangle({ x: X(cx - 0.18 + i * 0.09), y: Y(0.46), width: S * 0.04, height: S * 0.03, color: col(stone) });
    poly([[cx - 0.04, 0.18], [cx - 0.04, 0.32], [cx, 0.36], [cx + 0.04, 0.32], [cx + 0.04, 0.18]], [0.45, 0.33, 0.4]);
    // dragon vert
    const dx = 0.7 + rnd() * 0.12;
    ellipse(dx, 0.14, 0.09, 0.05, [0.5, 0.78, 0.55]);
    ellipse(dx - 0.07, 0.2, 0.04, 0.03, [0.5, 0.78, 0.55]);
    poly([[dx + 0.06, 0.14], [dx + 0.16, 0.1], [dx + 0.06, 0.09]], [0.5, 0.78, 0.55]);
    poly([[dx - 0.02, 0.18], [dx + 0.02, 0.3], [dx + 0.05, 0.17]], [0.95, 0.6, 0.55]);
    circle(dx - 0.075, 0.21, 0.006, [0.2, 0.25, 0.3]);
    hill(0.0, 0.08, [0.55, 0.78, 0.55], rnd() * 3 + 2);
  } else if (key === 'robots') {
    const gear = (u, v, r, c) => {
      circle(u, v, r, c);
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        circle(u + (Math.cos(a) * r * S) / box.width * 1.15, v + (Math.sin(a) * r * S) / box.height * 1.15, r * 0.3, c);
      }
      circle(u, v, r * 0.4, mix(pal.top, pal.bottom, 0.5));
    };
    gear(0.14, 0.82, 0.06, [0.7, 0.75, 0.88]);
    gear(0.26, 0.74, 0.04, [0.9, 0.7, 0.55]);
    gear(0.86, 0.84, 0.05, [0.75, 0.8, 0.9]);
    page.drawRectangle({ x: box.x, y: box.y, width: box.width, height: box.height * 0.14, color: col([0.62, 0.68, 0.84]) });
    const rx = 0.35 + rnd() * 0.3;
    page.drawRectangle({ x: X(rx - 0.1), y: Y(0.14), width: S * 0.2, height: S * 0.26, color: col([0.95, 0.96, 0.99]) });
    page.drawRectangle({ x: X(rx - 0.12), y: Y(0.38), width: S * 0.24, height: S * 0.19, color: col([0.88, 0.9, 0.97]) });
    circle(rx - 0.04, 0.48, 0.035, [0.45, 0.7, 0.95]);
    circle(rx + 0.04, 0.48, 0.035, [0.45, 0.7, 0.95]);
    poly([[rx - 0.005, 0.57], [rx - 0.005, 0.67], [rx + 0.005, 0.67], [rx + 0.005, 0.57]], [0.6, 0.65, 0.8]);
    circle(rx, 0.68, 0.02, [0.95, 0.5, 0.5]);
    circle(rx, 0.28, 0.035, [0.95, 0.5, 0.5]);
    for (const dx of [-0.17, 0.17]) poly([[rx + dx - 0.015, 0.14 + 0.1], [rx + dx - 0.015, 0.34], [rx + dx + 0.015, 0.34], [rx + dx + 0.015, 0.24]], [0.8, 0.84, 0.94]);
  } else if (key === 'circus') {
    const cx = 0.3 + rnd() * 0.4;
    page.drawRectangle({ x: box.x, y: box.y, width: box.width, height: box.height * 0.14, color: col([0.98, 0.88, 0.62]) });
    const stripes = 6;
    for (let i = 0; i < stripes; i++) {
      const u0 = cx - 0.27 + (i * 0.54) / stripes;
      const u1 = u0 + 0.54 / stripes;
      const top = cx - 0.01 + (i * 0.02) / stripes * 0.6;
      poly([[u0, 0.14], [u1, 0.14], [cx + 0.0 + (i + 1 - stripes / 2) * 0.004, 0.62], [cx + (i - stripes / 2) * 0.004, 0.62]], i % 2 ? [0.99, 0.97, 0.94] : [0.95, 0.4, 0.5]);
    }
    poly([[cx - 0.29, 0.14], [cx - 0.29, 0.42], [cx - 0.0, 0.62], [cx + 0.29, 0.42], [cx + 0.29, 0.14]], [0.95, 0.4, 0.5], 0.0);
    poly([[cx - 0.04, 0.14], [cx - 0.04, 0.3], [cx, 0.34], [cx + 0.04, 0.3], [cx + 0.04, 0.14]], [0.55, 0.3, 0.45]);
    poly([[cx, 0.62], [cx, 0.74], [cx + 0.07, 0.69]], pal.accent);
    for (let i = 0; i < 10; i++) star(rnd(), 0.5 + rnd() * 0.45, 0.012 + rnd() * 0.012, pal.accent, 0.9);
    const bx = [0.1, 0.88, 0.8];
    bx.forEach((u, i) => {
      circle(u, 0.52 + i * 0.1, 0.045, [[0.95, 0.4, 0.5], [0.45, 0.7, 0.95], [0.6, 0.85, 0.6]][i]);
      poly([[u, 0.52 + i * 0.1 - 0.045], [u, 0.2], [u + 0.004, 0.2], [u + 0.004, 0.52 + i * 0.1 - 0.045]], [0.5, 0.5, 0.55]);
    });
  } else if (key === 'mystery') {
    for (let i = 0; i < 30; i++) star(rnd(), 0.5 + rnd() * 0.5, 0.005 + rnd() * 0.009, white, 0.5 + rnd() * 0.5);
    circle(0.8, 0.8, 0.09, [0.99, 0.96, 0.82]);
    circle(0.77, 0.83, 0.02, [0.92, 0.89, 0.75]);
    let u = 0;
    while (u < 1) {
      const w = 0.12 + rnd() * 0.08;
      const h = 0.22 + rnd() * 0.18;
      poly([[u, 0.06], [u, h], [u + w, h], [u + w, 0.06]], mix([0.3, 0.3, 0.55], [0.2, 0.2, 0.42], rnd()));
      poly([[u - 0.01, h], [u + w / 2, h + 0.1], [u + w + 0.01, h]], [0.25, 0.22, 0.46]);
      for (let k = 0; k < 2; k++) page.drawRectangle({ x: X(u + w * (0.2 + k * 0.4)), y: Y(h - 0.1), width: S * 0.035, height: S * 0.05, color: col(rnd() > 0.3 ? pal.accent : [0.3, 0.3, 0.5]) });
      u += w + 0.01;
    }
    hill(0.0, 0.07, [0.22, 0.2, 0.42], rnd() * 3);
    const lx = 0.3 + rnd() * 0.4;
    page.drawCircle({ x: X(lx), y: Y(0.14), size: 0.07 * S, borderColor: col([0.99, 0.9, 0.6]), borderWidth: S * 0.012, color: col([0.7, 0.85, 0.95]), opacity: 0.35 });
    poly([[lx + 0.045, 0.1], [lx + 0.1, 0.03], [lx + 0.115, 0.045], [lx + 0.06, 0.115]], [0.99, 0.9, 0.6]);
  } else if (key === 'fairies') {
    for (let i = 0; i < 26; i++) star(rnd(), 0.4 + rnd() * 0.55, 0.006 + rnd() * 0.01, pal.accent, 0.5 + rnd() * 0.5);
    hill(0.1, 0.14, [0.62, 0.8, 0.7], rnd() * 3);
    const mx = 0.2 + rnd() * 0.5;
    poly([[mx - 0.012, 0.1], [mx - 0.012, 0.3], [mx + 0.012, 0.3], [mx + 0.012, 0.1]], [0.95, 0.9, 0.85]);
    ellipse(mx, 0.3, 0.12, 0.07, [0.95, 0.5, 0.65]);
    for (const [u, v] of [[-0.05, 0.31], [0.04, 0.34], [0.07, 0.28]]) circle(mx + u, v, 0.014, [1, 1, 1], 0.9);
    const fx = 0.65 + rnd() * 0.2;
    ellipse(fx - 0.04, 0.62, 0.05, 0.025, [0.85, 0.9, 1], 0.8);
    ellipse(fx + 0.04, 0.62, 0.05, 0.025, [0.85, 0.9, 1], 0.8);
    poly([[fx - 0.014, 0.5], [fx + 0.014, 0.5], [fx + 0.022, 0.66], [fx - 0.022, 0.66]], [0.99, 0.75, 0.85]);
    circle(fx, 0.69, 0.016, [1, 0.9, 0.82]);
    circle(fx, 0.54, 0.07, pal.accent, 0.3);
    hill(0.0, 0.08, [0.45, 0.68, 0.58], rnd() * 3 + 1);
  } else if (key === 'polar') {
    for (let i = 0; i < 14; i++) star(rnd(), 0.6 + rnd() * 0.4, 0.005 + rnd() * 0.007, white, 0.7);
    for (let k = 0; k < 3; k++) poly([[0.05 + k * 0.28, 0.9], [0.2 + k * 0.28, 0.9], [0.3 + k * 0.28, 0.55], [0.12 + k * 0.28, 0.55]], [[0.55, 0.9, 0.8], [0.7, 0.8, 0.95], [0.6, 0.95, 0.85]][k], 0.28);
    poly([[0, 0.3], [0.25, 0.4], [0.5, 0.3], [0.75, 0.42], [1, 0.32], [1, 0], [0, 0]], [0.97, 0.99, 1]);
    const px = 0.25 + rnd() * 0.5;
    ellipse(px, 0.2, 0.07, 0.09, [0.2, 0.22, 0.32]);
    ellipse(px, 0.19, 0.045, 0.065, [1, 1, 1]);
    circle(px, 0.3, 0.035, [0.2, 0.22, 0.32]);
    poly([[px - 0.01, 0.29], [px + 0.025, 0.29], [px + 0.01, 0.26]], [0.99, 0.7, 0.3]);
    circle(px - 0.01, 0.31, 0.005, white);
    poly([[0.78, 0.3], [0.78, 0.42], [0.9, 0.3]], [0.88, 0.95, 1]);
    hill(0.0, 0.06, [0.88, 0.94, 0.99], rnd() * 3);
  } else if (key === 'sports') {
    page.drawRectangle({ x: box.x, y: box.y, width: box.width, height: box.height * 0.45, color: col([0.55, 0.8, 0.5]) });
    for (let i = 0; i < 6; i++) poly([[i / 6, 0], [(i + 0.5) / 6, 0], [(i + 0.5) / 6, 0.45], [i / 6, 0.45]], [0.5, 0.76, 0.46], 0.5);
    poly([[0.0, 0.22], [1, 0.22], [1, 0.225], [0, 0.225]], white, 0.8);
    circle(0.5, 0.22, 0.07, white, 0.0);
    page.drawCircle({ x: X(0.5), y: Y(0.22), size: 0.07 * S, borderColor: col(white), borderWidth: S * 0.006, opacity: 0 });
    circle(0.85, 0.82, 0.08, pal.accent, 0.9);
    for (let k = 0; k < 2; k++) {
      const gx = k ? 0.88 : 0.04;
      poly([[gx, 0.08], [gx, 0.4], [gx + 0.08, 0.4], [gx + 0.08, 0.08]], white, 0.0);
      page.drawRectangle({ x: X(gx), y: Y(0.08), width: S * 0.08, height: S * 0.32, borderColor: col(white), borderWidth: S * 0.008, opacity: 0 });
    }
    const bx = 0.3 + rnd() * 0.4;
    circle(bx, 0.16, 0.05, white);
    for (const [u, v] of [[0, 0.16], [-0.025, 0.14], [0.025, 0.14], [0, 0.185]]) circle(bx + u, v, 0.012, [0.25, 0.25, 0.3]);
    for (let i = 0; i < 4; i++) star(0.1 + rnd() * 0.8, 0.55 + rnd() * 0.4, 0.014, pal.accent, 0.9);
    poly([[0.7, 0.45], [0.7, 0.56], [0.74, 0.56], [0.74, 0.5], [0.78, 0.5], [0.78, 0.56], [0.82, 0.56], [0.82, 0.45]], [0.98, 0.78, 0.35]);
  } else if (key === 'bakery') {
    page.drawRectangle({ x: box.x, y: box.y, width: box.width, height: box.height * 0.22, color: col([0.88, 0.7, 0.5]) });
    const cx = 0.3 + rnd() * 0.3;
    poly([[cx - 0.14, 0.22], [cx - 0.14, 0.36], [cx + 0.14, 0.36], [cx + 0.14, 0.22]], [0.98, 0.9, 0.78]);
    poly([[cx - 0.12, 0.36], [cx - 0.12, 0.46], [cx + 0.12, 0.46], [cx + 0.12, 0.36]], [0.98, 0.78, 0.86]);
    poly([[cx - 0.14, 0.36], [cx + 0.14, 0.36], [cx + 0.14, 0.385], [cx - 0.14, 0.385]], white);
    poly([[cx - 0.12, 0.46], [cx + 0.12, 0.46], [cx + 0.12, 0.485], [cx - 0.12, 0.485]], white);
    for (const dx of [-0.06, 0, 0.06]) {
      poly([[cx + dx - 0.004, 0.485], [cx + dx - 0.004, 0.56], [cx + dx + 0.004, 0.56], [cx + dx + 0.004, 0.485]], [1, 0.95, 0.8]);
      circle(cx + dx, 0.575, 0.012, [1, 0.7, 0.3]);
    }
    for (const dx of [-0.07, 0.0, 0.07]) circle(cx + dx, 0.505 - 0.018, 0.018, [0.9, 0.25, 0.3]);
    const wx = 0.75 + rnd() * 0.1;
    ellipse(wx, 0.28, 0.11, 0.035, [0.95, 0.8, 0.5]);
    ellipse(wx, 0.3, 0.07, 0.02, [0.85, 0.6, 0.3]);
    for (let i = 0; i < 12; i++) circle(rnd(), 0.55 + rnd() * 0.4, 0.005, white, 0.7);
    circle(0.9, 0.85, 0.07, pal.accent, 0.8);
  } else {
    circle(0.78, 0.8, 0.12, [1, 0.88, 0.55], 0.95);
    hill(0.12, 0.08, [0.93, 0.74, 0.4], rnd() * 3);
    // acacia
    const ax = 0.15 + rnd() * 0.2;
    poly([[ax - 0.012, 0.1], [ax - 0.004, 0.42], [ax + 0.012, 0.42], [ax + 0.016, 0.1]], [0.45, 0.33, 0.25]);
    ellipse(ax, 0.46, 0.17, 0.045, [0.45, 0.66, 0.35]);
    ellipse(ax + 0.08, 0.5, 0.1, 0.03, [0.5, 0.72, 0.4]);
    // girafe
    const gx = 0.55 + rnd() * 0.2;
    const gold = [0.97, 0.76, 0.36];
    ellipse(gx, 0.28, 0.09, 0.055, gold);
    for (const o of [-0.06, -0.02, 0.03, 0.07]) poly([[gx + o, 0.26], [gx + o, 0.08], [gx + o + 0.014, 0.08], [gx + o + 0.014, 0.26]], gold);
    poly([[gx + 0.05, 0.3], [gx + 0.09, 0.7], [gx + 0.115, 0.7], [gx + 0.095, 0.3]], gold);
    ellipse(gx + 0.12, 0.72, 0.035, 0.022, gold);
    circle(gx + 0.13, 0.73, 0.006, [0.25, 0.2, 0.18]);
    for (const [u, v] of [[-0.03, 0.29], [0.02, 0.26], [0.09, 0.5], [0.095, 0.62], [0.01, 0.31]]) circle(gx + u, v, 0.012, [0.7, 0.45, 0.2]);
    hill(0.0, 0.07, [0.86, 0.66, 0.34], rnd() * 3 + 1);
    for (let i = 0; i < 10; i++) circle(rnd(), 0.62 + rnd() * 0.3, 0.004, [1, 1, 1], 0.7);
  }
}
