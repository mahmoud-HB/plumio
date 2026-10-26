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
  return 'forest';
}

export const PALETTES = {
  space: { top: [0.16, 0.14, 0.38], bottom: [0.55, 0.42, 0.78], accent: [0.98, 0.85, 0.5] },
  forest: { top: [0.78, 0.9, 0.9], bottom: [0.86, 0.95, 0.78], accent: [0.99, 0.9, 0.6] },
  pirates: { top: [1, 0.86, 0.78], bottom: [0.7, 0.85, 0.95], accent: [0.99, 0.78, 0.45] },
  heroes: { top: [0.99, 0.72, 0.68], bottom: [0.6, 0.62, 0.9], accent: [0.99, 0.88, 0.45] },
  unicorns: { top: [0.84, 0.8, 0.97], bottom: [0.99, 0.84, 0.9], accent: [1, 0.92, 0.7] }
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
  } else {
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
  }
}
