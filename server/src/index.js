import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import OpenAI from 'openai';
import mime from 'mime-types';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const USE_AI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

// The OpenAI client throws at construction without a key; the local generator needs none.
const openai = USE_AI ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const THEMES = ['Espace', 'Forêt magique', 'Pirates', 'Super-héros', 'Licornes'];

// Réglages coût/latence
const PAGE_COUNT = Number(process.env.PAGE_COUNT || 6);
const IMAGE_SIZE = process.env.IMAGE_SIZE || '256x256';
const MODEL_TEXT = process.env.MODEL_TEXT || 'gpt-4o-mini';
const MODEL_IMAGE = process.env.MODEL_IMAGE || 'gpt-image-1';

/**
 * Génère PAGE_COUNT blocs de texte en français, style enfant (2–3 phrases/page).
 */
async function generateStoryPages({ childName, theme }) {
  const prompt = `
Tu es un auteur d'histoires pour enfants. Écris une histoire courte, chaleureuse et bienveillante, adaptée à un enfant, sur le thème "${theme}", avec le personnage principal "${childName}".
- Découpe en ${PAGE_COUNT} pages.
- Chaque page: 2 à 3 phrases, vocabulaire simple, positif, sans violence.
- Retourne UNIQUEMENT un JSON valide sous la forme d'un tableau de ${PAGE_COUNT} chaînes (une par page), rien d'autre.
`.trim();

  const completion = await openai.chat.completions.create({
    model: MODEL_TEXT,
    temperature: 0.7,
    messages: [
      { role: 'system', content: 'Tu écris uniquement pour des enfants, ton ton est doux et positif.' },
      { role: 'user', content: prompt }
    ]
  });

  const content = completion.choices?.[0]?.message?.content || '';
  let pages;
  try {
    pages = JSON.parse(content);
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      pages = JSON.parse(match[0]);
    }
  }

  if (!Array.isArray(pages) || pages.length !== PAGE_COUNT) {
    throw new Error(`Le modèle n’a pas retourné ${PAGE_COUNT} pages valides.`);
  }

  return pages;
}

/**
 * Génère une image par page via gpt-image-1
 */
async function generateIllustrations({ childName, theme, count = PAGE_COUNT }) {
  const images = [];
  for (let i = 0; i < count; i++) {
    const prompt = `
Illustration style album jeunesse, couleurs pastel et douces, personnages expressifs, composition claire.
Thème: ${theme}.
Personnage principal: un enfant nommé ${childName}.
Ambiance positive et chaleureuse.
`.trim();

    try {
      const res = await openai.images.generate({
        model: MODEL_IMAGE,
        prompt,
        size: IMAGE_SIZE
      });

      const b64 = res.data?.[0]?.b64_json;
      if (!b64) throw new Error('Image non générée');
      images.push(b64);
    } catch (err) {
      // If OpenAI image generation fails, try in order:
      // 1) Hugging Face Inference API (if HUGGINGFACE_API_KEY provided)
      // 2) Picsum.photos (free, no API key) as a cheap placeholder image
      let handled = false;
      const hfKey = process.env.HUGGINGFACE_API_KEY;
      if (hfKey) {
        try {
          const model = process.env.HF_MODEL || 'stabilityai/stable-diffusion-2';
          const hfResp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${hfKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt })
          });

          if (!hfResp.ok) {
            const txt = await hfResp.text().catch(() => 'no body');
            throw new Error(`HF inference failed: ${hfResp.status} ${txt}`);
          }

          const arrayBuffer = await hfResp.arrayBuffer();
          const b64 = Buffer.from(arrayBuffer).toString('base64');
          images.push(b64);
          handled = true;
        } catch (hfErr) {
          console.error('Hugging Face image generation failed:', hfErr?.message || hfErr);
          // continue to try picsum
        }
      }

      if (!handled) {
        try {
          // Picsum provides free placeholder images without API key
          const seed = encodeURIComponent(`${childName}-${theme}-${i}`);
          const sizeParts = (IMAGE_SIZE || '256x256').split('x');
          const w = parseInt(sizeParts[0], 10) || 256;
          const h = parseInt(sizeParts[1], 10) || 256;
          const picsumUrl = `https://picsum.photos/seed/${seed}/${w}/${h}`;
          const picsumResp = await fetch(picsumUrl);
          if (picsumResp.ok) {
            const arrayBuffer = await picsumResp.arrayBuffer();
            const b64 = Buffer.from(arrayBuffer).toString('base64');
            images.push(b64);
            handled = true;
          }
        } catch (picsumErr) {
          console.error('Picsum fetch failed:', picsumErr?.message || picsumErr);
        }
      }

      if (!handled) {
        // give up for this image and return placeholder (null) — buildPdf will draw placeholders
        console.error('All image generation fallbacks failed for prompt:', prompt, 'original error:', err?.message || err);
        images.push(null);
      }
    }
  }
  return images;
}

/**
 * Local fallback generators when OpenAI is not available or quota is exceeded.
 */
function generateStoryPagesFallback({ childName, theme }) {
  const starters = [
    `Un jour, ${childName} découvrit un secret sur ${theme.toLowerCase()}.`,
    `${childName} adorait explorer ${theme.toLowerCase()} et trouver de nouvelles aventures.`,
    `Dans un coin de ${theme.toLowerCase()}, ${childName} rencontra un ami spécial.`
  ];

  const actions = [
    `Ils rirent ensemble et partagèrent un trésor de gentillesse.`,
    `Ils apprirent qu'entraide et curiosité rendent tout possible.`,
    `Chaque jour, ${childName} devenait plus courageux et généreux.`
  ];

  const endings = [
    `Et ils vécurent des aventures heureuses tous les jours.`,
    `C'était le début d'une belle histoire pleine de sourires.`,
    `Depuis ce jour, ${childName} sut qu'il pouvait toujours compter sur ses amis.`
  ];

  const pages = [];
  for (let i = 0; i < PAGE_COUNT; i++) {
    const s = starters[i % starters.length];
    const a = actions[(i + 1) % actions.length];
    const e = endings[(i + 2) % endings.length];
    const page = `${s} ${a} ${e}`;
    pages.push(page);
  }
  return pages;
}

function generateIllustrationsFallback({ childName, theme, count = PAGE_COUNT }) {
  // Return null placeholders — buildPdf will draw simple placeholders when no image is available
  return new Array(count).fill(null);
}

/**
 * Construit le PDF:
 * - Couverture: Titre + photo (si fournie)
 * - Pages suivantes: Texte + Illustration
 */
async function buildPdf({ childName, theme, pagesText, imagesB64, coverPhotoBuffer, coverPhotoMime }) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Page de couverture
  {
    const page = pdfDoc.addPage([612, 792]);
    page.drawRectangle({
      x: 0, y: 0, width: page.getWidth(), height: page.getHeight(),
      color: rgb(0.96, 0.98, 1.0)
    });

    const title = `L'histoire de ${childName}`;
    page.drawText(title, {
      x: 40,
      y: page.getHeight() - 100,
      size: 36,
      font,
      color: rgb(0.2, 0.2, 0.5)
    });

    page.drawText(`Thème: ${theme}`, {
      x: 40,
      y: page.getHeight() - 145,
      size: 18,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.5)
    });

    if (coverPhotoBuffer && coverPhotoBuffer.length > 0) {
      try {
        let embedded;
        const subtype = (coverPhotoMime || '').toLowerCase();
        if (subtype.includes('png')) {
          embedded = await pdfDoc.embedPng(coverPhotoBuffer);
        } else {
          embedded = await pdfDoc.embedJpg(coverPhotoBuffer);
        }
        const imgWidth = 320;
        const scale = imgWidth / embedded.width;
        const imgHeight = embedded.height * scale;
        const x = (page.getWidth() - imgWidth) / 2;
        const y = (page.getHeight() - imgHeight) / 2 - 40;

        page.drawImage(embedded, { x, y, width: imgWidth, height: imgHeight });
      } catch {
        // ignore pour MVP
      }
    }
  }

  // Pages d'histoire
  for (let i = 0; i < pagesText.length; i++) {
    const page = pdfDoc.addPage([612, 792]);
    page.drawRectangle({
      x: 0, y: 0, width: page.getWidth(), height: page.getHeight(),
      color: rgb(1, 1, 0.98)
    });

    const text = pagesText[i];

    // Illustration: embed AI image if present, otherwise draw a simple placeholder
    const b64 = imagesB64[i];
    if (b64) {
      const imgBytes = Buffer.from(b64, 'base64');
      try {
        const embedded = await pdfDoc.embedPng(imgBytes);
        const maxImgWidth = 360;
        const scale = Math.min(maxImgWidth / embedded.width, 1);
        const imgWidth = embedded.width * scale;
        const imgHeight = embedded.height * scale;
        const x = (page.getWidth() - imgWidth) / 2;
        const y = page.getHeight() - imgHeight - 80;
        page.drawImage(embedded, { x, y, width: imgWidth, height: imgHeight });
      } catch {
        // ignore si erreur d'image
      }
    } else {
      const placeholderWidth = 360;
      const placeholderHeight = 220;
      const x = (page.getWidth() - placeholderWidth) / 2;
      const y = page.getHeight() - placeholderHeight - 80;

      page.drawRectangle({ x, y, width: placeholderWidth, height: placeholderHeight, color: rgb(0.9, 0.95, 1) });

      const themeText = `Thème: ${theme}`;
      page.drawText(themeText, { x: x + 12, y: y + placeholderHeight - 28, size: 16, font: fontRegular, color: rgb(0.15, 0.15, 0.35) });

      const caption = `${childName} - Illustration (placeholder)`;
      page.drawText(caption, { x: x + 12, y: y + 12, size: 12, font: fontRegular, color: rgb(0.2, 0.2, 0.3) });
    }

    // Texte
    const textX = 50;
    const textY = 200;
    const fontSize = 16;
    const maxWidth = page.getWidth() - 100;

    const lines = wrapText(text, fontRegular, fontSize, maxWidth);
    let cursorY = textY;
    for (const line of lines) {
      page.drawText(line, {
        x: textX,
        y: cursorY,
        size: fontSize,
        font: fontRegular,
        color: rgb(0.1, 0.1, 0.2)
      });
      cursorY -= fontSize + 6;
    }

    // Numéro de page (couverture = 1)
    page.drawText(`Page ${i + 2}`, {
      x: page.getWidth() - 90,
      y: 30,
      size: 12,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.6)
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

app.post('/api/generate', upload.single('photo'), async (req, res) => {
  try {
    const { name, theme } = req.body;
    if (!name || !theme) {
      return res.status(400).json({ error: 'Champs requis: name, theme' });
    }

    let pagesText;
    let imagesB64;

    const shouldUseAI = USE_AI && process.env.FORCE_LOCAL !== 'true';

    if (shouldUseAI) {
      try {
        pagesText = await generateStoryPages({ childName: name, theme });
        imagesB64 = await generateIllustrations({ childName: name, theme, count: PAGE_COUNT });
      } catch (err) {
        console.error('OpenAI error, falling back to local generator', err?.message || err);
        pagesText = generateStoryPagesFallback({ childName: name, theme });
        imagesB64 = generateIllustrationsFallback({ childName: name, theme, count: PAGE_COUNT });
      }
    } else {
      pagesText = generateStoryPagesFallback({ childName: name, theme });
      imagesB64 = generateIllustrationsFallback({ childName: name, theme, count: PAGE_COUNT });
    }

    const coverPhotoBuffer = req.file?.buffer || null;
    const coverPhotoMime = req.file?.mimetype || null;

    const pdfBuffer = await buildPdf({
      childName: name,
      theme,
      pagesText,
      imagesB64,
      coverPhotoBuffer,
      coverPhotoMime
    });

    const filenameSafe = `${name}-${theme}`.toLowerCase().replace(/[^\w\-]+/g, '-');
    const fileName = `histoire-${filenameSafe}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la génération.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// On Vercel the app is invoked as a serverless function and must not open a port.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

export default app;