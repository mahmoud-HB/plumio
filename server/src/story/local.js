import { LOCAL_STORIES as BASE } from './local-stories.js';
import { MORE_STORIES } from './local-stories-more.js';
import { themeKey } from '../pdf/scenes.js';
import { PAGE_COUNT } from './validate.js';

const LOCAL_STORIES = { ...BASE, ...MORE_STORIES };

const typo = (s) => s.replace(/(\p{L})'(\p{L})/gu, '$1\u2019$2');

/** Histoire complète sans IA, personnalisée avec le prénom. */
export function localStory({ name, theme }) {
  const tpl = LOCAL_STORIES[themeKey(theme)];
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
