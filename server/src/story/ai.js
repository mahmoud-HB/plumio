import { PAGE_COUNT, validateStory, wordTarget } from './validate.js';

const SYSTEM = 'Tu es un auteur d’albums jeunesse francophone, primé pour la qualité de ton écriture. Tu écris des histoires originales, chaleureuses, rythmées, sans violence ni peur excessive. Tu réponds uniquement par un objet JSON valide.';

function planPrompt({ name, age, theme }) {
  return `Conçois le plan narratif d’un album illustré personnalisé.
Enfant : prénom « ${name} », ${age} ans. Thème : « ${theme} ».
Le genre de l’enfant est inconnu : n’utilise ni « il » ni « elle » pour lui, évite les accords genrés qui le concernent.

Réponds avec cet objet JSON :
{
  "title": "titre original et accrocheur (max 70 caractères, contient le prénom ou y fait allusion)",
  "subtitle": "une phrase d’accroche courte pour la couverture",
  "intro": "une courte introduction de 1 à 2 phrases qui donne envie de lire",
  "characterLook": "description visuelle en anglais, très précise et stable, du personnage principal (sans visage réaliste : un enfant stylisé d’album jeunesse, vêtements et couleurs) et des personnages secondaires",
  "problem": "l’objectif ou le problème à résoudre",
  "characters": [{"name":"...","role":"...","traits":"..."}],
  "beats": ["étape 1", "..."]
}
"beats" contient exactement ${PAGE_COUNT} étapes distinctes et progressives : 1 mise en situation, 2 déclencheur, 3 départ, 4 première difficulté, 5-6 péripéties, 7 rebondissement, 8 moment clé, 9 résolution, 10 conclusion positive. 2 à 3 personnages secondaires utiles à l’intrigue.`;
}

function writePrompt({ name, age, theme }, plan, feedback) {
  const t = wordTarget(age);
  return `Rédige l’album en ${PAGE_COUNT} pages à partir de ce plan.

PLAN :
${JSON.stringify(plan, null, 2)}

Enfant : « ${name} », ${age} ans. Thème : « ${theme} ».
Règles :
- Exactement ${PAGE_COUNT} pages, une seule étape du plan par page, dans l’ordre, avec une continuité logique d’une page à l’autre.
- Chaque page : entre ${t.min} et ${t.max} mots, un paragraphe narratif développé (dialogues bienvenus), vocabulaire adapté à ${age} ans.
- Aucune phrase ni formulation répétée d’une page à l’autre ; varie les débuts de phrases ; utilise le prénom avec parcimonie (pronoms, « l’enfant », sujets variés) mais sans jamais employer « il/elle » pour ${name}.
- Ton chaleureux, vrai début, développement et fin positive.
- "scene" : une description visuelle courte en anglais de l’illustration de la page (lieu, personnages présents, action), cohérente avec "characterLook".
${feedback ? `\nATTENTION, ta tentative précédente avait ces défauts, corrige-les :\n- ${feedback.join('\n- ')}\n` : ''}
Réponds avec :
{"pages":[{"title":"petit titre (max 6 mots)","text":"…","scene":"…"}, …${PAGE_COUNT} éléments]}`;
}

async function askJson(openai, model, user, { temperature }) {
  const completion = await openai.chat.completions.create({
    model,
    temperature,
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }]
  });
  const content = completion.choices?.[0]?.message?.content || '';
  try {
    return JSON.parse(content);
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('Réponse du modèle non exploitable (JSON manquant).');
    return JSON.parse(m[0]);
  }
}

/**
 * Génération en deux étapes (plan puis rédaction) avec validation et jusqu'à `attempts` essais.
 * Lève une erreur si aucune version valide n'est obtenue ; l'appelant décide du repli.
 */
export async function aiStory(openai, model, input, { attempts = 3 } = {}) {
  const plan = await askJson(openai, model, planPrompt(input), { temperature: 0.9 });
  if (!plan?.title || !Array.isArray(plan.beats) || plan.beats.length < PAGE_COUNT) {
    throw new Error('Plan narratif incomplet.');
  }

  let feedback = null;
  let lastProblems = [];
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const written = await askJson(openai, model, writePrompt(input, plan, feedback), { temperature: 0.8 });
    const story = {
      title: String(plan.title).trim(),
      subtitle: String(plan.subtitle || '').trim(),
      intro: String(plan.intro || '').trim(),
      characterLook: String(plan.characterLook || '').trim(),
      pages: (written.pages || []).map((p, i) => ({
        n: i + 1,
        title: String(p?.title || '').trim(),
        text: String(p?.text || '').trim(),
        scene: String(p?.scene || '').trim()
      }))
    };
    const { ok, problems } = validateStory(story, input);
    if (ok) return { story, attempts: attempt };
    lastProblems = problems;
    feedback = problems.slice(0, 6);
    console.warn(`[story] tentative ${attempt} rejetée :`, problems.slice(0, 4).join(' | '));
  }
  const err = new Error(`Histoire non conforme après ${attempts} essais : ${lastProblems.slice(0, 3).join(' ')}`);
  err.code = 'story_invalid';
  throw err;
}
