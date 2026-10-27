import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HISTOIRE } from '../src/games/content/histoire.js';
import { GEO } from '../src/games/content/geo.js';
import { CHASSE, BINGO, ESCAPE, DEFIS } from '../src/games/content/activites.js';

const THEME_KEYS = ['space', 'forest', 'pirates', 'heroes', 'unicorns', 'dinos', 'ocean', 'knights', 'safari', 'robots', 'circus', 'mystery', 'fairies', 'polar', 'sports', 'bakery'];
const str = (s, max = 200) => typeof s === 'string' && s.trim().length > 2 && s.length <= max && !/\n/.test(s);

function checkQuiz(list, label, { min }) {
  assert.ok(list.length >= min, `${label} : au moins ${min} questions (${list.length})`);
  const seen = new Set();
  list.forEach((x, i) => {
    const w = `${label}[${i}]`;
    assert.ok([1, 2, 3].includes(x.level), `${w} level 1|2|3`);
    assert.ok(str(x.q, 130), `${w} q (<=130 car.)`);
    assert.ok(Array.isArray(x.choices) && x.choices.length === 3 && x.choices.every((c) => str(c, 40) || (typeof c === 'string' && c.length > 0 && c.length <= 40)), `${w} 3 choix (<=40 car.)`);
    assert.equal(new Set(x.choices).size, 3, `${w} choix distincts`);
    assert.ok([0, 1, 2].includes(x.answer), `${w} answer 0|1|2`);
    assert.ok(str(x.why, 150), `${w} why (<=150 car.)`);
    assert.ok(!seen.has(x.q), `${w} doublon`); seen.add(x.q);
  });
  for (const lv of [1, 2, 3]) assert.ok(list.filter((x) => x.level === lv).length >= Math.floor(min / 5), `${label} : assez de questions niveau ${lv}`);
  // Les bonnes réponses ne doivent pas toutes être au même rang
  const dist = [0, 1, 2].map((k) => list.filter((x) => x.answer === k).length);
  assert.ok(Math.min(...dist) >= list.length * 0.2, `${label} : bonnes réponses mal réparties ${dist}`);
}

function checkVF(list, label, { min }) {
  assert.ok(list.length >= min, `${label} : au moins ${min} affirmations (${list.length})`);
  list.forEach((x, i) => {
    const w = `${label}[${i}]`;
    assert.ok([1, 2, 3].includes(x.level), `${w} level`);
    assert.ok(str(x.s, 110), `${w} s (<=110 car.)`);
    assert.equal(typeof x.answer, 'boolean', `${w} answer boolean`);
    assert.ok(str(x.why, 150), `${w} why (<=150 car.)`);
  });
  const t = list.filter((x) => x.answer).length;
  assert.ok(t >= list.length * 0.35 && t <= list.length * 0.65, `${label} : vrai/faux déséquilibré`);
}

function checkPairs(list, label, { min }) {
  assert.ok(list.length >= min, `${label} : au moins ${min} paires`);
  list.forEach((x, i) => {
    assert.ok([1, 2, 3].includes(x.level), `${label}[${i}] level`);
    assert.ok(typeof x.a === 'string' && x.a.length <= 24 && typeof x.b === 'string' && x.b.length <= 24, `${label}[${i}] a/b (<=24 car.)`);
  });
  assert.equal(new Set(list.map((x) => x.a)).size, list.length, `${label} : a en double`);
  assert.equal(new Set(list.map((x) => x.b)).size, list.length, `${label} : b en double`);
}

test('contenu histoire', () => {
  for (const band of ['moyens', 'grands']) {
    checkQuiz(HISTOIRE[band].quiz, `histoire.${band}.quiz`, { min: 30 });
    checkVF(HISTOIRE[band].vf, `histoire.${band}.vf`, { min: 20 });
  }
  const f = HISTOIRE.grands.frise;
  assert.ok(f.length >= 6, 'au moins 6 frises (grands)');
  for (const set of f) {
    assert.ok(str(set.title, 60), 'frise title');
    assert.ok(set.events.length === 6, 'frise : 6 événements');
    assert.equal(new Set(set.events.map((e) => e.year)).size, 6, 'frise : années distinctes');
    set.events.forEach((e) => assert.ok(str(e.label, 52) && Number.isInteger(e.year) && str(e.date, 20), `frise ${set.title} : label (<=52 car.), year entier, date texte (<=20 car.)`));
    assert.ok([1, 2, 3].includes(set.level), 'frise level');
  }
});

test('contenu géographie', () => {
  for (const band of ['moyens', 'grands']) {
    checkQuiz(GEO[band].quiz, `geo.${band}.quiz`, { min: 30 });
    checkVF(GEO[band].vf, `geo.${band}.vf`, { min: 20 });
    checkPairs(GEO[band].pairs, `geo.${band}.pairs`, { min: 24 });
  }
});

test('contenu activités', () => {
  for (const band of ['petits', 'moyens', 'grands']) {
    const c = CHASSE[band];
    assert.ok(c.generic.length >= 24 && c.generic.every((s) => str(s, 90)), `chasse.${band}.generic >= 24 (<=90 car.)`);
    for (const k of THEME_KEYS) assert.ok(c.themed[k]?.length >= 6 && c.themed[k].every((s) => str(s, 90)), `chasse.${band}.themed.${k} >= 6`);
    assert.ok(BINGO[band].length >= 30 && BINGO[band].every((s) => str(s, 28) || (typeof s === 'string' && s.length <= 28 && s.length > 1)) && new Set(BINGO[band]).size === BINGO[band].length, `bingo.${band} >= 30 uniques (<=28 car.)`);
    assert.ok(DEFIS[band].length >= 30 && DEFIS[band].every((s) => str(s, 110)), `defis.${band} >= 30 (<=110 car.)`);
  }
  for (const band of ['moyens', 'grands']) {
    assert.ok(ESCAPE[band].length >= 6, `escape.${band} >= 6 scénarios`);
    for (const e of ESCAPE[band]) {
      assert.ok(str(e.title, 50) && str(e.intro, 160), 'escape title/intro (<=160 car.)');
      assert.ok([1, 2, 3].includes(e.level), 'escape level');
      assert.equal(e.riddles.length, 5, 'escape : 5 énigmes');
      e.riddles.forEach((r) => assert.ok(str(r.text, 170) && /^[A-Z]{3,10}$/.test(r.answer) && str(r.why, 110), `escape ${e.title} : text<=170, answer = 1 mot MAJUSCULES sans accent (3-10 lettres), why<=110`));
      assert.ok(/^[A-Z]{5}$/.test(e.code), 'escape : code final = 5 lettres majuscules');
      assert.equal(e.riddles.map((r) => r.answer[0]).join(''), e.code, 'escape : la 1re lettre des 5 réponses forme le code final');
    }
  }
});
