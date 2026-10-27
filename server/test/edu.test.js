import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveLevel, problems, tables } from '../src/games/edu-math.js';
import { makeRng } from '../src/games/puzzles.js';
import { GAMES } from '../src/games/catalog.js';
import { buildGamesPdf } from '../src/games/render.js';

test('niveau automatique selon l’âge exact', () => {
  assert.deepEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) => resolveLevel(a)), [1, 2, 3, 1, 2, 3, 1, 2, 2, 3]);
  assert.equal(resolveLevel(4, 3), 3);
});

test('générateurs de maths : réponses cohérentes et déterministes', () => {
  for (const band of ['moyens', 'grands']) {
    for (const level of [1, 2, 3]) {
      const a = problems(band, level, makeRng('x'), 'Léa', 6);
      const b = problems(band, level, makeRng('x'), 'Léa', 6);
      assert.deepEqual(a, b);
      a.forEach((p) => assert.ok(p.text && p.answer && p.steps && !p.answer.includes('NaN')));
    }
  }
  tables(2, makeRng('t'), 16).forEach((t) => {
    const [x, y] = t.text.split('×').map((n) => parseInt(n, 10));
    assert.equal(Number(t.answer), x * y);
  });
});

test('chaque jeu éducatif se génère pour tous les niveaux, avec corrigé', async () => {
  const ages = { petits: 4, moyens: 7, grands: 11 };
  for (const g of GAMES.filter((x) => x.edu)) {
    for (const level of [0, 1, 3]) {
      const pdf = await buildGamesPdf({ name: 'Anne-Sophie Marie-Charlotte', age: ages[g.band], gameIds: [g.id], solution: true, level });
      assert.ok(pdf.length > 2000, `${g.band}/${g.id}`);
    }
  }
});
