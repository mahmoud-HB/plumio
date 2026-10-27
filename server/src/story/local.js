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
import { PETITS_E } from './bands/petits-e.js';
import { MOYENS_E } from './bands/moyens-e.js';
import { GRANDS_E } from './bands/grands-e.js';
import { themeKey } from '../pdf/scenes.js';
import { PAGE_COUNT } from './validate.js';

// Une histoire par thème et par tranche d'âge : petits (3-5), moyens (6-8), grands (9+).
const BANDS = {
  petits: { ...PETITS_A, ...PETITS_B, ...PETITS_C, ...PETITS_D },
  moyens: { ...BASE, ...MORE_STORIES, ...MOYENS_NEW, ...MOYENS_D },
  grands: { ...GRANDS_A, ...GRANDS_B, ...GRANDS_C, ...GRANDS_D }
};

// Histoires supplémentaires : une même tranche d'âge peut proposer plusieurs histoires par thème.
const EXTRA = { petits: [PETITS_E], moyens: [MOYENS_E], grands: [GRANDS_E] };

function variantsOf(band, key) {
  return [BANDS[band][key] || BANDS.moyens[key], ...EXTRA[band].map((x) => x[key]).filter(Boolean)];
}

/** Nombre d'histoires disponibles pour ce thème et cet âge. */
export function storyCount({ theme, age }) {
  return variantsOf(ageBand(age), themeKey(theme)).length;
}

export function ageBand(age) {
  const a = Number(age);
  if (!Number.isFinite(a)) return 'moyens';
  if (a <= 5) return 'petits';
  if (a >= 9) return 'grands';
  return 'moyens';
}

const typo = (s) => s.replace(/(\p{L})'(\p{L})/gu, '$1\u2019$2');

/** Histoire complète sans IA, adaptée à l'âge et personnalisée avec le prénom. */
export function localStory({ name, theme, age, variant = 0 }) {
  const all = variantsOf(ageBand(age), themeKey(theme));
  const tpl = all[Number.isInteger(variant) && variant >= 0 ? variant % all.length : 0];
  const fill = (s) => typo(s.replaceAll('{name}', name));
  const lesson = tpl.lesson ? fill(tpl.lesson) : '';
  const last = Math.min(tpl.pages.length, PAGE_COUNT) - 1;
  return {
    title: fill(tpl.title),
    subtitle: fill(tpl.subtitle),
    intro: fill(tpl.intro),
    lesson,
    characterLook: '',
    pages: tpl.pages.slice(0, PAGE_COUNT).map(([title, text], i) => ({
      n: i + 1,
      title: fill(title),
      // La leçon clôt la dernière page, dans un paragraphe distinct
      text: fill(text) + (lesson && i === last ? `\n${fill('Ce que {name} retient : ')}${tpl.lesson.startsWith('{') ? lesson : lesson.charAt(0).toLowerCase() + lesson.slice(1)}` : ''),
      scene: tpl.scenes[i]
    }))
  };
}
