// Règles de mise en page centralisées (A4 portrait, en points PDF). Aucune coordonnée en dur ailleurs.

export const PAGE = { width: 595.28, height: 841.89 };
export const MARGIN = { top: 48, bottom: 64, side: 56 };
export const CONTENT_WIDTH = PAGE.width - MARGIN.side * 2;

export const BODY = { maxSize: 15, minSize: 11.5, step: 0.5, leading: 1.55, paragraphGap: 0.7 };
// Essais successifs : on réduit d'abord un peu l'image et la police avant de couper la page en deux.
export const FIT_STEPS = [
  { imageRatio: 0.5, minSize: 13 },
  { imageRatio: 0.44, minSize: 12.5 },
  { imageRatio: 0.4, minSize: 12 },
  { imageRatio: 0.36, minSize: 11.5 }
];
export const IMAGE_RATIO = { default: 0.5, continuation: 0.26 };
export const GAP = { afterImage: 26, afterTitle: 12 };
export const TITLE_SIZE = 20;

// Seuls les glyphes Latin-1 + quelques ponctuations françaises sont embarqués dans les polices.
const UNSUPPORTED = /[^\n\u0020-\u007E\u00A0-\u00FF\u0152\u0153\u0178\u2018-\u201D\u2013\u2014\u2026\u20AC]/g;

export function sanitize(text) {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u2028\u2029]/g, '\n')
    .replace(/[\u200B-\u200F\uFEFF]/g, '')
    .replace(/\u2192/g, '->')
    .replace(UNSUPPORTED, '')
    .replace(/[ \t]+/g, ' ')
    // Espaces insécables à la française : évitent « ou ? isolés en bout de ligne.
    .replace(/« /g, '«\u00A0')
    .replace(/ ([»:;!?])/g, '\u00A0$1')
    .trim();
}

function breakLongWord(word, font, size, maxWidth) {
  const parts = [];
  let current = '';
  for (const ch of word) {
    if (current && font.widthOfTextAtSize(current + ch, size) > maxWidth) {
      parts.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/** Retours à la ligne mot à mot ; un mot plus large que la ligne est coupé en dernier recours. */
export function wrapParagraph(text, font, size, maxWidth) {
  const words = text.split(/[ \t\n]+/).filter(Boolean).flatMap((w) =>
    font.widthOfTextAtSize(w, size) > maxWidth ? breakLongWord(w, font, size, maxWidth) : [w]
  );
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Retourne les lignes (null = espace entre paragraphes) et la hauteur totale pour une taille donnée. */
export function layoutText(text, font, size, maxWidth, { leading = BODY.leading, paragraphGap = BODY.paragraphGap } = {}) {
  const paragraphs = sanitize(text).split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const lineHeight = size * leading;
  const lines = [];
  let height = 0;
  paragraphs.forEach((p, i) => {
    if (i > 0) {
      lines.push(null);
      height += lineHeight * paragraphGap;
    }
    for (const l of wrapParagraph(p, font, size, maxWidth)) {
      lines.push(l);
      height += lineHeight;
    }
  });
  return { lines, height, size, lineHeight };
}

/** Plus grande taille de police qui tient dans maxHeight ; null si même la taille minimale déborde. */
export function fitText(text, font, maxWidth, maxHeight, minSize = BODY.minSize) {
  for (let size = BODY.maxSize; size >= minSize - 1e-6; size -= BODY.step) {
    const result = layoutText(text, font, size, maxWidth);
    if (result.height <= maxHeight) return result;
  }
  return null;
}

/** Découpe un texte trop long en deux morceaux équilibrés, à la frontière d'une phrase. */
export function splitAtSentences(text) {
  const clean = sanitize(text);
  const sentences = clean.match(/[^.!?…]+[.!?…]+["»”]?\s*|[^.!?…]+$/g) || [clean];
  if (sentences.length < 2) return [clean];
  const half = clean.length / 2;
  let first = '';
  let best = 0;
  let bestDelta = Infinity;
  sentences.forEach((s, i) => {
    first += s;
    const delta = Math.abs(first.length - half);
    if (i < sentences.length - 1 && delta < bestDelta) {
      bestDelta = delta;
      best = i;
    }
  });
  return [sentences.slice(0, best + 1).join('').trim(), sentences.slice(best + 1).join('').trim()];
}

/** Zones d'une page de récit : l'image prend `imageRatio` de la hauteur de page, le texte le reste. */
export function storyPageBoxes(imageRatio = IMAGE_RATIO.default, { hasTitle = true } = {}) {
  const image = {
    x: MARGIN.side,
    y: PAGE.height - MARGIN.top - PAGE.height * imageRatio,
    width: CONTENT_WIDTH,
    height: PAGE.height * imageRatio
  };
  const titleTop = image.y - GAP.afterImage;
  const titleBlock = hasTitle ? TITLE_SIZE + GAP.afterTitle : 0;
  const textTop = titleTop - titleBlock;
  return {
    image,
    titleBaseline: titleTop - TITLE_SIZE * 0.8,
    text: { x: MARGIN.side, top: textTop, bottom: MARGIN.bottom, width: CONTENT_WIDTH, height: textTop - MARGIN.bottom }
  };
}

/** Recadrage « cover » : remplit la boîte sans déformer, centré sur le point focal (0..1). */
export function coverFit(imgWidth, imgHeight, box, focus = { x: 0.5, y: 0.5 }) {
  const scale = Math.max(box.width / imgWidth, box.height / imgHeight);
  const width = imgWidth * scale;
  const height = imgHeight * scale;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const x = clamp(box.x + (box.width - width) * focus.x, box.x + box.width - width, box.x);
  const y = clamp(box.y + (box.height - height) * (1 - focus.y), box.y + box.height - height, box.y);
  return { x, y, width, height };
}

/** Type d'image d'après les octets (JPEG/PNG), sans se fier au type MIME déclaré. */
export function detectImageType(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  return null;
}
