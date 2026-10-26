import { LOCAL_STORIES as BASE } from './local-stories.js';
import { MORE_STORIES } from './local-stories-more.js';
import { MOYENS_NEW } from './bands/moyens-new.js';
import { PETITS_A } from './bands/petits-a.js';
import { PETITS_B } from './bands/petits-b.js';
import { PETITS_C } from './bands/petits-c.js';
import { GRANDS_A } from './bands/grands-a.js';
import { GRANDS_B } from './bands/grands-b.js';
import { GRANDS_C } from './bands/grands-c.js';
import { PETITS_D } from './bands/petits-d.js';
import { MOYENS_D } from './bands/moyens-d.js';
import { GRANDS_D } from './bands/grands-d.js';
import { themeKey } from '../pdf/scenes.js';
import { PAGE_COUNT } from './validate.js';

// Une histoire par thème et par tranche d'âge : petits (3-5), moyens (6-8), grands (9+).
const BANDS = {
  petits: { ...PETITS_A, ...PETITS_B, ...PETITS_C, ...PETITS_D },
  moyens: { ...BASE, ...MORE_STORIES, ...MOYENS_NEW, ...MOYENS_D },
  grands: { ...GRANDS_A, ...GRANDS_B, ...GRANDS_C, ...GRANDS_D }
};

export function ageBand(age) {
  const a = Number(age);
  if (!Number.isFinite(a)) return 'moyens';
  if (a <= 5) return 'petits';
  if (a >= 9) return 'grands';
  return 'moyens';
}

const typo = (s) => s.replace(/(\p{L})'(\p{L})/gu, '$1\u2019$2');

/** Histoire complète sans IA, adaptée à l'âge et personnalisée avec le prénom. */
export function localStory({ name, theme, age }) {
  const key = themeKey(theme);
  const tpl = BANDS[ageBand(age)][key] || BANDS.moyens[key];
  const fill = (s) => typo(s.replaceAll('{name}', name));
  return {
    title: fill(tpl.title),
    subtitle: fill(tpl.subtitle),
    intro: fill(tpl.intro),
    characterLook: '',
    pages: tpl.pages.slice(0, PAGE_COUNT).map(([title, text], i) => ({
      n: i + 1,
      title: fill(title),
      text: fill(text),
      scene: tpl.scenes[i]
    }))
  };
}
