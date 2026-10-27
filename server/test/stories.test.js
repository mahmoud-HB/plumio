import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localStory, storyCount } from '../src/story/local.js';
import { validateStory } from '../src/story/validate.js';

const THEMES = ['Espace', 'Forêt magique', 'Pirates', 'Super-héros', 'Licornes', 'Dinosaures', 'Océan', 'Chevaliers & dragons', 'Savane', 'Robots & inventions', 'Cirque', 'Mystère & détectives', 'Fées & lutins', 'Banquise', 'Sports & champions', 'Pâtisserie & cuisine'];

test('chaque histoire (toutes variantes, 3 tranches d’âge) est valide, distincte et porte une leçon', () => {
  const titles = new Set();
  for (const age of [4, 7, 10]) {
    for (const theme of THEMES) {
      for (let v = 0; v < storyCount({ theme, age }); v++) {
        const s = localStory({ name: 'Anne-Sophie', theme, age, variant: v });
        const check = validateStory(s, { name: 'Anne-Sophie', age });
        assert.ok(check.ok, `${age} ans ${theme} #${v} : ${check.problems?.join(' ')}`);
        assert.ok(s.lesson && s.lesson.length > 15, `${age} ans ${theme} #${v} : leçon manquante`);
        assert.ok(s.pages[9].text.includes('Ce que Anne-Sophie retient'));
        assert.ok(s.pages.every((p) => p.scene), `${age} ans ${theme} #${v} : scène manquante`);
        assert.ok(!titles.has(`${age}|${s.title}`), `titre en double : ${s.title}`);
        titles.add(`${age}|${s.title}`);
      }
    }
  }
});
