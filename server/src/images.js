import { PAGE_COUNT } from './story/validate.js';

const ALLOWED_SIZES = new Set(['1024x1024', '1024x1536', '1536x1024', 'auto']);

const STYLE = 'Children’s picture book illustration, soft gouache and watercolour texture, gentle pastel palette (cream, lavender, powder pink, pastel blue), warm light, rounded friendly shapes, consistent character design across the whole book, no text, no letters, no captions, no watermark.';

function imagePrompt({ story, theme, name }, scene, isCover) {
  const look = story.characterLook ? `Characters (keep identical in every illustration): ${story.characterLook}.` : `Main character: a stylised child called ${name}.`;
  const what = isCover
    ? `Book cover scene, wide and inviting, showing the main character at the start of the adventure: ${story.title}.`
    : `Scene: ${scene}.`;
  return `${STYLE} Theme: ${theme}. ${look} ${what}`.slice(0, 3800);
}

const isFatal = (err) => {
  const status = err?.status;
  const code = err?.code || err?.error?.code;
  return status === 401 || status === 403 || code === 'insufficient_quota' || code === 'billing_hard_limit_reached' || code === 'invalid_api_key';
};

async function openaiImage(openai, model, size, prompt) {
  const params = { model, prompt, size, n: 1 };
  if (model.startsWith('gpt-image')) {
    // JPEG compressé : garde le PDF léger (< 4,5 Mo de réponse sur Vercel).
    params.quality = process.env.IMAGE_QUALITY || 'low';
    params.output_format = 'jpeg';
    params.output_compression = 75;
  } else {
    params.response_format = 'b64_json';
  }
  const res = await openai.images.generate(params, { timeout: 90_000, maxRetries: 1 });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error('Image non générée');
  return Buffer.from(b64, 'base64');
}

async function huggingFaceImage(prompt) {
  const model = process.env.HF_MODEL || 'stabilityai/stable-diffusion-2';
  const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: prompt }),
    signal: AbortSignal.timeout(60_000)
  });
  if (!resp.ok) throw new Error(`HF inference failed: ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}

/**
 * Cover + 10 illustrations générées en parallèle (concurrence limitée). Une image en échec vaut `null` :
 * le PDF affichera alors l'illustration vectorielle du thème. Aucune image « au hasard » n'est jamais insérée.
 * Les illustrations viennent du texte de l'histoire (scène par page) ; la photo de l'enfant n'est PAS utilisée pour les générer.
 */
export async function generateIllustrations({ openai, story, theme, name, concurrency = 4 }) {
  const model = process.env.MODEL_IMAGE || 'gpt-image-1';
  const requested = process.env.IMAGE_SIZE || '1024x1024';
  const size = ALLOWED_SIZES.has(requested) ? requested : '1024x1024';
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  const jobs = [{ key: 'cover', prompt: imagePrompt({ story, theme, name }, '', true) }, ...story.pages.slice(0, PAGE_COUNT).map((p, i) => ({
    key: i,
    prompt: imagePrompt({ story, theme, name }, p.scene || p.title, false)
  }))];

  const results = { cover: null, pages: new Array(PAGE_COUNT).fill(null) };
  let aborted = false;
  let failures = 0;
  let next = 0;

  async function worker() {
    while (next < jobs.length && !aborted) {
      const job = jobs[next++];
      let buf = null;
      try {
        if (!openai) throw new Error('no openai');
        buf = await openaiImage(openai, model, size, job.prompt);
      } catch (err) {
        if (openai && isFatal(err)) aborted = true;
        if (openai) console.error('[images] OpenAI :', err?.message || err);
        if (hfKey) {
          try {
            buf = await huggingFaceImage(job.prompt);
          } catch (hfErr) {
            console.error('[images] Hugging Face :', hfErr?.message || hfErr);
          }
        }
      }
      if (!buf) failures++;
      if (job.key === 'cover') results.cover = buf;
      else results.pages[job.key] = buf;
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
  return { ...results, failures, total: jobs.length };
}
