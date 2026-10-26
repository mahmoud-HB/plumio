import { readFile } from 'node:fs/promises';
import {
  PDFDocument, rgb, pushGraphicsState, popGraphicsState, moveTo, lineTo, appendBezierCurve, closePath, clip, endPath
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
  PAGE, MARGIN, CONTENT_WIDTH, FIT_STEPS, IMAGE_RATIO, TITLE_SIZE,
  sanitize, fitText, layoutText, wrapParagraph, splitAtSentences, storyPageBoxes, coverFit, detectImageType
} from './layout.js';
import { drawScene, PALETTES, themeKey } from './scenes.js';

// Les chemins sont écrits littéralement pour que le bundler Vercel embarque les fichiers de police.
const FONT_FILES = {
  body: new URL('../../fonts/lora-latin-400-normal.woff', import.meta.url),
  italic: new URL('../../fonts/lora-latin-400-italic.woff', import.meta.url),
  bold: new URL('../../fonts/lora-latin-600-normal.woff', import.meta.url),
  title: new URL('../../fonts/fredoka-latin-600-normal.woff', import.meta.url),
  label: new URL('../../fonts/fredoka-latin-500-normal.woff', import.meta.url)
};

const COLORS = {
  paper: rgb(1, 0.985, 0.955),
  ink: rgb(0.2, 0.17, 0.3),
  plum: rgb(0.43, 0.32, 0.68),
  lavender: rgb(0.86, 0.82, 0.97),
  blush: rgb(0.98, 0.86, 0.9),
  muted: rgb(0.58, 0.54, 0.7),
  white: rgb(1, 1, 1)
};

export async function loadFonts(doc) {
  doc.registerFontkit(fontkit);
  const entries = await Promise.all(
    Object.entries(FONT_FILES).map(async ([k, url]) => [k, await doc.embedFont(await readFile(url), { subset: true })])
  );
  return Object.fromEntries(entries);
}

function roundedRectOps(x, y, w, h, r) {
  const k = 0.5523 * r;
  return [
    moveTo(x + r, y),
    lineTo(x + w - r, y), appendBezierCurve(x + w - r + k, y, x + w, y + r - k, x + w, y + r),
    lineTo(x + w, y + h - r), appendBezierCurve(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h),
    lineTo(x + r, y + h), appendBezierCurve(x + r - k, y + h, x, y + h - r + k, x, y + h - r),
    lineTo(x, y + r), appendBezierCurve(x, y + r - k, x + r - k, y, x + r, y),
    closePath()
  ];
}

function rrect(page, box, r, options) {
  const { x, width: w, height: h } = box;
  const top = PAGE.height - (box.y + h);
  const d = `M ${x + r} ${top} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${top + r} V ${top + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${top + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${top + h - r} V ${top + r} A ${r} ${r} 0 0 1 ${x + r} ${top} Z`;
  page.drawSvgPath(d, { x: 0, y: PAGE.height, ...options });
}

function withClip(page, box, radius, draw) {
  page.pushOperators(pushGraphicsState(), ...roundedRectOps(box.x, box.y, box.width, box.height, radius), clip(), endPath());
  try {
    draw();
  } finally {
    page.pushOperators(popGraphicsState());
  }
}

async function embedImage(doc, buf) {
  const type = detectImageType(buf);
  if (!type) return null;
  try {
    return type === 'png' ? await doc.embedPng(buf) : await doc.embedJpg(buf);
  } catch {
    return null;
  }
}

/** Image recadrée « cover » dans un cadre arrondi ; illustration vectorielle du thème si l'image manque. */
async function drawIllustration(ctx, page, box, imageBuf, { seed, focus, radius = 18 } = {}) {
  const embedded = imageBuf ? await embedImage(ctx.doc, imageBuf) : null;
  withClip(page, box, radius, () => {
    if (embedded) {
      const r = coverFit(embedded.width, embedded.height, box, focus);
      page.drawImage(embedded, r);
    } else {
      drawScene(page, box, ctx.theme, seed);
    }
  });
  rrect(page, box, radius, { borderColor: COLORS.white, borderWidth: 3, borderOpacity: 0.9 });
  return Boolean(embedded);
}

function drawPaper(page, { frame = true } = {}) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: COLORS.paper });
  if (frame) {
    rrect(page, { x: 26, y: 26, width: PAGE.width - 52, height: PAGE.height - 52 }, 14, { borderColor: COLORS.lavender, borderWidth: 1 });
  }
}

function drawCentered(page, text, font, size, centerX, y, color) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: centerX - w / 2, y, size, font, color });
}

function drawLines(page, layout, font, x, topY, color) {
  let y = topY;
  for (const line of layout.lines) {
    if (line === null) {
      y -= layout.lineHeight * 0.7;
      continue;
    }
    y -= layout.lineHeight;
    page.drawText(line, { x, y: y + layout.lineHeight * 0.28, size: layout.size, font, color });
  }
  return y;
}

function drawFolio(page, ctx, label) {
  drawCentered(page, `\u2014  ${label}  \u2014`, ctx.fonts.label, 10.5, PAGE.width / 2, 36, COLORS.muted);
}

async function drawCover(ctx, story, childName, imageBuf, photoBuf) {
  const { doc, fonts } = ctx;
  const page = doc.addPage([PAGE.width, PAGE.height]);
  drawPaper(page);
  const cx = PAGE.width / 2;

  page.drawRectangle({ x: 0, y: PAGE.height - 26, width: PAGE.width, height: 26, color: COLORS.lavender });
  drawCentered(page, 'PLUMIO', fonts.title, 12, cx, PAGE.height - 78, COLORS.plum);

  const imgBox = { x: MARGIN.side, y: PAGE.height * 0.37, width: CONTENT_WIDTH, height: PAGE.height * 0.46 };
  await drawIllustration(ctx, page, imgBox, imageBuf, { seed: 0, radius: 26 });

  if (photoBuf) {
    const embedded = await embedImage(doc, photoBuf);
    if (embedded) {
      const d = 104;
      const badge = { x: imgBox.x + imgBox.width - d - 18, y: imgBox.y - d / 2, width: d, height: d };
      page.drawCircle({ x: badge.x + d / 2, y: badge.y + d / 2, size: d / 2 + 5, color: COLORS.paper });
      withClip(page, badge, d / 2, () => {
        const r = coverFit(embedded.width, embedded.height, badge, { x: 0.5, y: 0.35 });
        page.drawImage(embedded, r);
      });
      page.drawCircle({ x: badge.x + d / 2, y: badge.y + d / 2, size: d / 2 + 2.5, borderColor: COLORS.plum, borderWidth: 2.5 });
    }
  }

  // Titre et sous-titre doivent tenir entre l'illustration et la pastille : le titre réduit sa taille au besoin
  const title = sanitize(story.title);
  const sub = sanitize(story.subtitle || '');
  const subLayout = sub ? layoutText(sub, fonts.italic, 14, CONTENT_WIDTH - 60) : null;
  const subLines = subLayout ? subLayout.lines.filter((l) => l !== null).slice(0, 2) : [];
  const subHeight = subLines.length ? subLines.length * (subLayout.lineHeight) + 8 : 0;
  const top = imgBox.y - 66;
  const available = top - 112 - subHeight;
  let size = 40;
  let lines = wrapParagraph(title, fonts.title, size, CONTENT_WIDTH - 20);
  while ((lines.length > 3 || lines.length * size * 1.15 > available + size * 0.4) && size > 22) {
    size -= 2;
    lines = wrapParagraph(title, fonts.title, size, CONTENT_WIDTH - 20);
  }
  let y = top;
  for (const l of lines.slice(0, 3)) {
    drawCentered(page, l, fonts.title, size, cx, y, COLORS.plum);
    y -= size * 1.15;
  }
  for (const l of subLines) {
    y -= 4;
    drawCentered(page, l, fonts.italic, 14, cx, y - 10, COLORS.ink);
    y -= subLayout.lineHeight - 4;
  }

  const pill = `Une histoire pour ${sanitize(childName)}`;
  const pillSize = 14;
  const pillW = Math.min(fonts.title.widthOfTextAtSize(pill, pillSize) + 44, CONTENT_WIDTH);
  const pillBox = { x: cx - pillW / 2, y: 62, width: pillW, height: 32 };
  rrect(page, pillBox, 16, { color: COLORS.plum });
  drawCentered(page, pill, fonts.title, pillSize, cx, pillBox.y + 10.5, COLORS.white);
  drawCentered(page, 'Un livre personnalisé créé avec Plumio', fonts.label, 9.5, cx, 40, COLORS.muted);
}

async function drawStoryPage(ctx, entry, imageBuf, { continuation = false, ratio, text, folio }) {
  const { doc, fonts } = ctx;
  const page = doc.addPage([PAGE.width, PAGE.height]);
  drawPaper(page);
  const boxes = storyPageBoxes(ratio, { hasTitle: Boolean(entry.title) && !continuation });
  await drawIllustration(ctx, page, boxes.image, imageBuf, { seed: entry.n, focus: { x: 0.5, y: 0.45 } });

  if (entry.title && !continuation) {
    drawCentered(page, sanitize(entry.title), fonts.title, TITLE_SIZE, PAGE.width / 2, boxes.titleBaseline, COLORS.plum);
  }

  const area = { ...boxes.text, top: continuation ? boxes.image.y - 24 : boxes.text.top };
  area.height = area.top - area.bottom;
  const fitted = ctx.lastFit ?? fitText(text, fonts.body, area.width, area.height, 11.5);
  const layout = fitted ?? layoutText(text, fonts.body, 11.5, area.width);
  // Centre légèrement le bloc quand il laisse beaucoup de vide, pour éviter une page déséquilibrée.
  const slack = Math.max(0, area.height - layout.height);
  drawLines(page, layout, fonts.body, area.x, area.top - Math.min(slack * 0.3, 36), COLORS.ink);
  drawFolio(page, ctx, folio);
}

/**
 * story: { title, subtitle, pages: [{ n, title, text }] }
 * images: { cover: Buffer|null, pages: (Buffer|null)[] }, photo: Buffer|null
 * Retourne { pdf: Buffer, pageCount, usedImages, splitPages }
 */
export async function buildBook({ story, theme, childName, images = {}, photo = null }) {
  const doc = await PDFDocument.create();
  doc.setTitle(sanitize(story.title));
  doc.setAuthor('Plumio');
  doc.setProducer('Plumio');
  doc.setCreator('Plumio');
  doc.setLanguage('fr-FR');
  const fonts = await loadFonts(doc);
  const ctx = { doc, fonts, theme };

  await drawCover(ctx, story, childName, images.cover ?? null, photo);

  let splitPages = 0;
  for (let i = 0; i < story.pages.length; i++) {
    const entry = { ...story.pages[i], n: story.pages[i].n ?? i + 1 };
    const text = sanitize(entry.text);
    const img = images.pages?.[i] ?? null;
    const hasTitle = Boolean(entry.title);

    let chosen = null;
    for (const step of FIT_STEPS) {
      const area = storyPageBoxes(step.imageRatio, { hasTitle }).text;
      const fit = fitText(text, fonts.body, area.width, area.height, step.minSize);
      if (fit) {
        chosen = { ratio: step.imageRatio, fit };
        break;
      }
    }

    if (chosen) {
      ctx.lastFit = chosen.fit;
      await drawStoryPage(ctx, entry, img, { ratio: chosen.ratio, text, folio: String(entry.n) });
    } else {
      // Texte trop long même à la taille minimale : on le répartit sur deux pages plutôt que de le tronquer.
      splitPages++;
      const [first, second] = splitAtSentences(text);
      const ratio = FIT_STEPS.at(-1).imageRatio;
      ctx.lastFit = null;
      await drawStoryPage(ctx, entry, img, { ratio, text: first, folio: `${entry.n}` });
      if (second) {
        await drawStoryPage(ctx, entry, img, {
          continuation: true, ratio: IMAGE_RATIO.continuation, text: second, folio: `${entry.n} (suite)`
        });
      }
    }
    ctx.lastFit = null;
  }

  const bytes = await doc.save();
  return {
    pdf: Buffer.from(bytes),
    pageCount: doc.getPageCount(),
    splitPages,
    illustrated: (images.pages || []).filter(Boolean).length
  };
}

export { themeKey, PALETTES };
