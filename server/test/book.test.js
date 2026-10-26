import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { buildBook, loadFonts } from '../src/pdf/book.js';
import { PAGE, MARGIN, BODY, fitText, layoutText, splitAtSentences, coverFit, sanitize, storyPageBoxes, FIT_STEPS } from '../src/pdf/layout.js';
import { localStory } from '../src/story/local.js';
import { validateStory } from '../src/story/validate.js';

const THEMES = ['Espace', 'Forêt magique', 'Pirates', 'Super-héros', 'Licornes', 'Dinosaures', 'Océan', 'Chevaliers & dragons', 'Savane'];

async function fonts() {
  const doc = await PDFDocument.create();
  return loadFonts(doc);
}

test('chaque histoire locale est valide : 10 pages distinctes, sans répétition', () => {
  for (const theme of THEMES) {
    for (const name of ['Lina', 'Jean-Baptiste', 'Éloïse']) {
      const story = localStory({ name, theme });
      const { ok, problems } = validateStory(story, { name, age: 8 });
      assert.deepEqual(problems, [], `${theme}/${name}`);
      assert.ok(ok);
      assert.equal(new Set(story.pages.map((p) => p.text)).size, 10);
      assert.ok(story.pages.every((p) => !p.text.includes('{name}') && !p.title.includes('{name}')));
    }
  }
});

test('la validation rejette pages manquantes, trop courtes ou dupliquées', () => {
  const story = localStory({ name: 'Lina', theme: 'Pirates' });
  assert.equal(validateStory({ ...story, pages: story.pages.slice(0, 6) }, { name: 'Lina', age: 8 }).ok, false);
  const short = { ...story, pages: story.pages.map((p) => ({ ...p, text: 'Lina marche.' })) };
  assert.equal(validateStory(short, { name: 'Lina', age: 8 }).ok, false);
  const dup = { ...story, pages: story.pages.map((p) => ({ ...p, text: story.pages[0].text })) };
  const res = validateStory(dup, { name: 'Lina', age: 8 });
  assert.equal(res.ok, false);
  assert.ok(res.problems.some((p) => /similaires|répétée/.test(p)));
});

test('le texte tient dans la zone sans dépasser la largeur ni la hauteur', async () => {
  const f = await fonts();
  const story = localStory({ name: 'Maëlle', theme: 'Licornes' });
  for (const p of story.pages) {
    const area = storyPageBoxes(FIT_STEPS[0].imageRatio).text;
    const fit = fitText(p.text, f.body, area.width, area.height, 11.5);
    assert.ok(fit, 'le texte doit tenir');
    assert.ok(fit.height <= area.height);
    for (const line of fit.lines.filter(Boolean)) assert.ok(f.body.widthOfTextAtSize(line, fit.size) <= area.width + 0.01);
  }
});

test('un mot géant est coupé au lieu de déborder', async () => {
  const f = await fonts();
  const r = layoutText('A' + 'W'.repeat(120) + ' fin', f.body, 14, 400);
  assert.ok(r.lines.every((l) => !l || f.body.widthOfTextAtSize(l, 14) <= 400));
});

test('coverFit remplit le cadre sans déformer', () => {
  const box = { x: 50, y: 100, width: 400, height: 300 };
  for (const [w, h] of [[1000, 1000], [3000, 1000], [500, 2000]]) {
    const r = coverFit(w, h, box);
    assert.ok(Math.abs(r.width / r.height - w / h) < 1e-6);
    assert.ok(r.x <= box.x + 1e-6 && r.x + r.width >= box.x + box.width - 1e-6);
    assert.ok(r.y <= box.y + 1e-6 && r.y + r.height >= box.y + box.height - 1e-6);
  }
});

test('sanitize garde les accents français et retire les glyphes non pris en charge', () => {
  assert.equal(sanitize('Éloïse à l’œuf « très » été… ✨ 🚀'), 'Éloïse à l’œuf «\u00A0très\u00A0» été…');
});

test('splitAtSentences coupe à une frontière de phrase', () => {
  const [a, b] = splitAtSentences('Un. Deux phrases ici. Trois encore là. Quatre enfin ici.');
  assert.ok(a.endsWith('.') && b.length > 0);
});

for (const theme of THEMES) {
  test(`PDF A4 de 11 pages pour « ${theme} »`, async () => {
    const story = localStory({ name: 'Zoé', theme });
    const { pdf, pageCount, splitPages } = await buildBook({ story, theme, childName: 'Zoé' });
    const doc = await PDFDocument.load(pdf);
    assert.equal(pageCount, 11);
    assert.equal(splitPages, 0);
    assert.equal(doc.getPageCount(), 11);
    for (const p of doc.getPages()) {
      assert.ok(Math.abs(p.getWidth() - PAGE.width) < 0.01 && Math.abs(p.getHeight() - PAGE.height) < 0.01);
    }
    assert.ok(pdf.length < 1_500_000);
  });
}

test('un texte très long est réparti sur une page supplémentaire, sans troncature', async () => {
  const story = localStory({ name: 'Zoé', theme: 'Espace' });
  const long = Array.from({ length: 28 }, (_, i) => `Phrase numéro ${i + 1} qui raconte une péripétie longue et détaillée avec des accents : été, forêt, cœur.`).join(' ');
  story.pages[3] = { ...story.pages[3], text: long };
  const { pageCount, splitPages } = await buildBook({ story, theme: 'Espace', childName: 'Zoé' });
  assert.equal(splitPages, 1);
  assert.equal(pageCount, 12);
});

test('une image corrompue ou non supportée retombe sur l’illustration de secours', async () => {
  const story = localStory({ name: 'Zoé', theme: 'Pirates' });
  const bad = Buffer.from('ceci n’est pas une image du tout, vraiment');
  const jpegHeaderOnly = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const { pageCount } = await buildBook({
    story, theme: 'Pirates', childName: 'Zoé',
    images: { cover: jpegHeaderOnly, pages: [bad, jpegHeaderOnly] }, photo: bad
  });
  assert.equal(pageCount, 11);
});

test('marges : la zone de texte reste dans les marges d’impression', () => {
  for (const step of FIT_STEPS) {
    const { text, image } = storyPageBoxes(step.imageRatio);
    assert.ok(text.bottom >= MARGIN.bottom && text.height > 150);
    assert.ok(image.y > text.top && image.x >= MARGIN.side && image.x + image.width <= PAGE.width - MARGIN.side);
    assert.ok(BODY.minSize >= 11.5);
  }
});
