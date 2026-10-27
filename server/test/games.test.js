import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import * as P from '../src/games/puzzles.js';
import { GAMES, BANDS, bandOf, gamesFor } from '../src/games/catalog.js';
import { buildGamesPdf, validateGameInput } from '../src/games/render.js';

const THEMES = ['Espace', 'Forêt magique', 'Pirates', 'Super-héros', 'Licornes', 'Dinosaures', 'Océan', 'Chevaliers & dragons', 'Savane', 'Robots & inventions', 'Cirque', 'Mystère & détectives', 'Fées & lutins', 'Banquise', 'Sports & champions', 'Pâtisserie & cuisine'];

test('chaque tranche d’âge propose ses jeux (8 de base + éducatifs/activités)', () => {
  for (const band of Object.keys(BANDS)) assert.equal(gamesFor(band).length, band === 'petits' ? 13 : 17, band);
  assert.equal(GAMES.length, 47);
  assert.deepEqual([3, 5, 6, 8, 9, 12].map(bandOf), ['petits', 'petits', 'moyens', 'moyens', 'grands', 'grands']);
});

test('les générateurs sont déterministes pour une même graine', () => {
  const a = P.maze(8, 8, P.makeRng('x'));
  const b = P.maze(8, 8, P.makeRng('x'));
  assert.deepEqual(a.path, b.path);
});

test('le labyrinthe a un chemin continu du départ à l’arrivée', () => {
  const m = P.maze(18, 22, P.makeRng('maze'));
  assert.deepEqual(m.path[0], [0, 0]);
  assert.deepEqual(m.path.at(-1), [21, 17]);
  m.path.slice(1).forEach(([r, c], i) => {
    const [pr, pc] = m.path[i];
    assert.equal(Math.abs(r - pr) + Math.abs(c - pc), 1);
    if (r === pr) assert.equal(m.east[r][Math.min(c, pc)], false);
    else assert.equal(m.south[Math.min(r, pr)][c], false);
  });
});

test('le sudoku est valide et sa solution unique', () => {
  for (const [n, blanks] of [[6, 18], [9, 45]]) {
    const s = P.sudoku(n, blanks, P.makeRng(`s${n}`));
    for (let i = 0; i < n; i++) {
      assert.equal(new Set(s.solution[i]).size, n);
      assert.equal(new Set(s.solution.map((r) => r[i])).size, n);
    }
    s.puzzle.forEach((row, r) => row.forEach((v, c) => { if (v) assert.equal(v, s.solution[r][c]); }));
    assert.ok(s.puzzle.flat().filter((v) => v === 0).length >= blanks * 0.8);
  }
});

test('le mots mêlés contient chaque mot placé', () => {
  const ws = P.wordSearch(['MAELYS', 'FUSEE', 'PLANETE', 'ETOILE'], 12, P.makeRng('w'), P.DIRS_ALL);
  assert.equal(ws.placed.length, 4);
  for (const p of ws.placed) {
    const read = [...p.word].map((_, i) => ws.grid[p.r + p.dr * i][p.c + p.dc * i]).join('');
    assert.equal(read, p.word);
  }
});

test('César : décodage par décalage inverse, anagramme différent du mot', () => {
  assert.equal(P.caesar(P.caesar('BRAVO ZOE', 5), 21), 'BRAVO ZOE');
  assert.notEqual(P.scramble('ETOILE', P.makeRng('a')), 'ETOILE');
  assert.equal(P.toGridWord('Éloïse-Zoë'), 'ELOISEZOE');
});

test('validation des entrées', () => {
  assert.ok(validateGameInput({ name: '', age: 7 }));
  assert.ok(validateGameInput({ name: 'x'.repeat(31), age: 7 }));
  assert.ok(validateGameInput({ name: 'Lina', age: 30 }));
  assert.equal(validateGameInput({ name: 'Lina', age: 7 }), null);
});

test('colonne : le mot clé se lit dans la colonne alignée', () => {
  const rows = P.columnWords('MAELYS', ['MAGIE', 'ETOILE', 'ELFE', 'LUTIN', 'POUDRE', 'FUSEE', 'SOLEIL', 'ASTRE', 'LUNE', 'ECLAIR', 'SYSTEME', 'MARS', 'SABLE', 'YACHT'], P.makeRng('c'));
  assert.ok(rows);
  assert.equal(rows.map((r) => r.word[r.pos]).join(''), 'MAELYS');
});

test('carré magique et pyramide : valeurs cohérentes', () => {
  const m = P.magicSquare(P.makeRng('m'));
  const g = m.grid;
  for (let i = 0; i < 3; i++) {
    assert.equal(g[i].reduce((a, b) => a + b), m.sum);
    assert.equal(g[0][i] + g[1][i] + g[2][i], m.sum);
  }
  assert.equal(g[0][0] + g[1][1] + g[2][2], m.sum);
  const p = P.pyramid(P.makeRng('p'));
  assert.equal(p.rows[0][0], p.rows[1][0] + p.rows[1][1]);
});

test('les jeux produisent des PDF A4 non vides, avec corrigés', async () => {
  for (const [age, expected] of [[4, 13 + 7], [7, 17 + 7 + 6], [11, 17 + 7 + 6]]) {
    const buf = await buildGamesPdf({ name: 'Éloïse', age, theme: 'Pirates', solution: true });
    const doc = await PDFDocument.load(buf);
    assert.equal(doc.getPageCount(), expected, `âge ${age}`);
    const { width, height } = doc.getPage(0).getSize();
    assert.ok(Math.abs(width - 595.28) < 0.1 && Math.abs(height - 841.89) < 0.1);
  }
});

test('thèmes, prénoms très longs ou accentués : aucun plantage', async () => {
  const names = ['Jean-Baptiste', 'Anne-Sophie Marie', 'Zoé', 'Maëlys', 'X', 'A'.repeat(30), 'Æ'];
  for (const [i, theme] of [...THEMES, ''].entries()) {
    const name = names[i % names.length];
    for (const age of [3, 7, 12]) {
      const buf = await buildGamesPdf({ name, age, theme, solution: true, variant: 2 });
      assert.ok(buf.length > 5000, `${theme}/${age}/${name}`);
    }
  }
});

test('un jeu seul génère une seule page, et la variante change la grille', async () => {
  const one = await PDFDocument.load(await buildGamesPdf({ name: 'Lina', age: 8, gameIds: ['sudoku'] }));
  assert.equal(one.getPageCount(), 1);
  const a = await buildGamesPdf({ name: 'Lina', age: 8, gameIds: ['sudoku'], variant: 0 });
  const b = await buildGamesPdf({ name: 'Lina', age: 8, gameIds: ['sudoku'], variant: 1 });
  assert.notEqual(Buffer.compare(a, b), 0);
});
