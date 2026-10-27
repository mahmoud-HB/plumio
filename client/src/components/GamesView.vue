<script setup>
import { computed, ref } from 'vue';
import { THEMES } from '../lib/themes.js';
import { fetchGamesCatalog, fetchGamesPdf } from '../lib/api.js';

const AGE_MIN = 3;
const AGE_MAX = 12;

const BANDS = [
  { id: 'petits', label: '3-5 ans', emoji: '🧸' },
  { id: 'moyens', label: '6-8 ans', emoji: '🎒' },
  { id: 'grands', label: '9-12 ans', emoji: '🧩' }
];

const games_all = ref([]);
const loadError = ref('');
fetchGamesCatalog().then((c) => { games_all.value = c.games; }).catch((e) => { loadError.value = e.message; });

const name = ref('');
const age = ref(7);
const theme = ref('');
const solution = ref(true);
const variant = ref(0);
const level = ref(0);
const busy = ref('');
const error = ref('');
const done = ref('');
const touched = ref(false);

const band = computed(() => (age.value <= 5 ? 'petits' : age.value >= 9 ? 'grands' : 'moyens'));
const bandInfo = computed(() => BANDS.find((b) => b.id === band.value));
const games = computed(() => games_all.value.filter((g) => g.band === band.value));
const trimmed = computed(() => name.value.trim());
const nameError = computed(() => (touched.value && !trimmed.value ? 'Indique le prénom de l’enfant.' : ''));

function stepAge(d) {
  age.value = Math.min(AGE_MAX, Math.max(AGE_MIN, age.value + d));
}

function save(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

async function download(gameId) {
  touched.value = true;
  if (busy.value) return;
  if (!trimmed.value) {
    document.getElementById('games-name')?.focus();
    return;
  }
  error.value = '';
  done.value = '';
  busy.value = gameId;
  try {
    const blob = await fetchGamesPdf({ name: trimmed.value, age: age.value, theme: theme.value, gameId, variant: variant.value, solution: solution.value, level: level.value });
    const slug = trimmed.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'enfant';
    save(blob, `plumio-jeux-${slug}-${gameId === 'all' ? band.value : gameId}.pdf`);
    done.value = gameId === 'all' ? `Les ${games.value.length} jeux de ${trimmed.value} sont téléchargés.` : 'Le jeu est téléchargé. Il ne reste plus qu’à imprimer !';
  } catch (e) {
    error.value = e.message || 'Une erreur est survenue.';
  } finally {
    busy.value = '';
  }
}
</script>

<template>
  <div class="games">
    <section class="games-hero">
      <span class="eyebrow">Jeux à imprimer</span>
      <h1>Des jeux au prénom de votre enfant</h1>
      <p class="lead">Plus de quinze jeux par tranche d’âge (logique, maths, histoire, géographie, activités), personnalisés avec son prénom et l’univers qu’il aime. Téléchargez en PDF, imprimez en A4, et c’est parti !</p>
    </section>

    <form class="games-form card" @submit.prevent="download('all')" novalidate>
      <div class="grid-2">
        <div class="field" :class="{ invalid: nameError }">
          <label for="games-name">Prénom de l’enfant</label>
          <input id="games-name" v-model="name" type="text" maxlength="30" autocomplete="off" placeholder="Ex : Lina" :aria-invalid="Boolean(nameError)" @blur="touched = true" />
          <p v-if="nameError" class="field-error">{{ nameError }}</p>
        </div>
        <div class="field">
          <label for="games-age">Âge</label>
          <div class="stepper">
            <button type="button" class="step-btn" :disabled="age <= AGE_MIN" aria-label="Diminuer l’âge" @click="stepAge(-1)">−</button>
            <output id="games-age" aria-live="polite">{{ age }} ans</output>
            <button type="button" class="step-btn" :disabled="age >= AGE_MAX" aria-label="Augmenter l’âge" @click="stepAge(1)">+</button>
          </div>
          <p class="field-hint">Tranche {{ bandInfo.label }} : {{ bandInfo.emoji }} les jeux s’adaptent.</p>
        </div>
      </div>

      <div class="field">
        <label for="games-theme">Univers (facultatif)</label>
        <select id="games-theme" v-model="theme">
          <option value="">Aventure (au choix)</option>
          <option v-for="t in THEMES" :key="t.id" :value="t.id">{{ t.emoji }} {{ t.id }}</option>
        </select>
        <p class="field-hint">Les mots, les messages et les objectifs reprennent cet univers.</p>
      </div>

      <div class="field">
        <label for="games-level">Niveau de difficulté</label>
        <select id="games-level" v-model.number="level">
          <option :value="0">Automatique (selon l’âge exact)</option>
          <option :value="1">Facile</option>
          <option :value="2">Moyen</option>
          <option :value="3">Difficile</option>
        </select>
        <p class="field-hint">Maths, histoire, géographie et énigmes : questions plus simples ou plus difficiles.</p>
      </div>

      <div class="games-options">
        <label class="check-row"><input v-model="solution" type="checkbox" /> Ajouter les corrigés pour les parents</label>
        <button type="button" class="btn btn-ghost btn-sm" @click="variant += 1">🔄 Nouvelles grilles</button>
      </div>
    </form>

    <div v-if="error" class="notice notice-error" role="alert">
      <span class="notice-icon" aria-hidden="true">!</span>
      <span>{{ error }}</span>
      <button type="button" class="icon-btn" aria-label="Fermer ce message" @click="error = ''">×</button>
    </div>
    <div v-if="done" class="notice notice-ok" role="status">
      <span class="notice-icon" aria-hidden="true">✓</span>
      <span>{{ done }}</span>
      <button type="button" class="icon-btn" aria-label="Fermer ce message" @click="done = ''">×</button>
    </div>

    <div class="games-head">
      <h2>{{ bandInfo.emoji }} Les {{ games.length || 16 }} jeux des {{ bandInfo.label }}</h2>
      <button class="btn btn-primary" :disabled="Boolean(busy)" @click="download('all')">
        {{ busy === 'all' ? 'Préparation…' : 'Tout télécharger (PDF)' }}
      </button>
    </div>

    <p v-if="loadError" class="notice notice-error" role="alert">{{ loadError }}</p>
    <div class="games-grid">
      <article v-for="g in games" :key="g.id" class="game-card">
        <span class="game-icon" aria-hidden="true">{{ g.icon }}</span>
        <h3>{{ g.title }}</h3>
        <p>{{ g.blurb }}</p>
        <small class="muted">Travaille : {{ g.skill }}</small>
        <button class="btn btn-ghost btn-sm" :disabled="Boolean(busy)" @click="download(g.id)">
          {{ busy === g.id ? 'Préparation…' : 'Télécharger' }}
        </button>
      </article>
    </div>

    <p class="muted games-note">Les PDF sont générés à la demande, sans compte, et le prénom n’est pas conservé. Imprimez en A4, échelle 100 %.</p>
  </div>
</template>
