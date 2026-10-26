<script setup>
import { computed, ref } from 'vue';
import { THEMES, AGE_MIN, AGE_MAX } from '../lib/themes.js';
import { prepareImage } from '../lib/media.js';

const props = defineProps({
  modelValue: { type: Object, required: true },
  loading: Boolean,
  error: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue', 'submit', 'dismiss-error']);

const touched = ref(false);
const photoError = ref('');
const photoBusy = ref(false);
const fileInput = ref(null);
const dragging = ref(false);
let objectUrl = '';

const form = computed(() => props.modelValue);
function patch(changes) {
  emit('update:modelValue', { ...props.modelValue, ...changes });
}

const nameError = computed(() => {
  if (!touched.value) return '';
  const n = form.value.name.trim();
  if (!n) return 'Indique le prénom de l’enfant.';
  if (n.length > 30) return 'Le prénom est trop long (30 caractères maximum).';
  return '';
});
const themeError = computed(() => (touched.value && !form.value.theme ? 'Choisis un thème pour l’histoire.' : ''));

function stepAge(delta) {
  patch({ age: Math.min(AGE_MAX, Math.max(AGE_MIN, Number(form.value.age) + delta)) });
}

async function handleFile(file) {
  photoError.value = '';
  if (!file) return;
  photoBusy.value = true;
  try {
    const { blob, url } = await prepareImage(file);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = url;
    patch({ photo: blob, photoUrl: url });
  } catch (e) {
    photoError.value = e.message;
  } finally {
    photoBusy.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
}

function removePhoto() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = '';
  patch({ photo: null, photoUrl: '' });
}

function onDrop(e) {
  dragging.value = false;
  handleFile(e.dataTransfer?.files?.[0]);
}

function submit() {
  touched.value = true;
  if (props.loading || nameError.value || !form.value.theme || !form.value.name.trim()) return;
  emit('submit');
}

</script>

<template>
  <form class="create card" novalidate @submit.prevent="submit">
    <header class="create-head">
      <span class="eyebrow">Étape unique</span>
      <h1>Créons son histoire</h1>
      <p class="lead">Trois informations suffisent. Le reste, c’est notre travail.</p>
    </header>

    <div v-if="error" class="notice notice-error" role="alert">
      <span class="notice-icon" aria-hidden="true">!</span>
      <div>
        <strong>Le livre n’a pas pu être créé.</strong>
        <p>{{ error }}</p>
        <p class="muted">Tes informations ont été conservées : tu peux réessayer.</p>
      </div>
      <button type="button" class="icon-btn" aria-label="Fermer ce message" @click="$emit('dismiss-error')">×</button>
    </div>

    <div class="grid-2">
      <div class="field" :class="{ invalid: nameError }">
        <label for="name">Prénom de l’enfant</label>
        <input
          id="name" type="text" autocomplete="off" maxlength="40" placeholder="Ex : Lina"
          :value="form.name" :disabled="loading" :aria-invalid="Boolean(nameError)" aria-describedby="name-err"
          @input="patch({ name: $event.target.value })" @blur="touched = true"
        />
        <p id="name-err" class="field-error" v-if="nameError">{{ nameError }}</p>
      </div>

      <div class="field">
        <label for="age">Âge</label>
        <div class="stepper">
          <button type="button" class="step-btn" :disabled="loading || form.age <= AGE_MIN" aria-label="Diminuer l’âge" @click="stepAge(-1)">−</button>
          <output id="age" aria-live="polite">{{ form.age }} ans</output>
          <button type="button" class="step-btn" :disabled="loading || form.age >= AGE_MAX" aria-label="Augmenter l’âge" @click="stepAge(1)">+</button>
        </div>
        <p class="field-hint">La longueur et le vocabulaire s’adaptent.</p>
      </div>
    </div>

    <fieldset class="field themes" :class="{ invalid: themeError }" :disabled="loading">
      <legend>Thème de l’histoire</legend>
      <div class="theme-grid">
        <label v-for="t in THEMES" :key="t.id" class="theme-card" :class="[`tone-${t.tone}`, { selected: form.theme === t.id }]">
          <input type="radio" name="theme" :value="t.id" :checked="form.theme === t.id" @change="patch({ theme: t.id })" />
          <span class="theme-emoji" aria-hidden="true">{{ t.emoji }}</span>
          <strong>{{ t.id }}</strong>
          <small>{{ t.tagline }}</small>
          <span class="check" aria-hidden="true">✓</span>
        </label>
      </div>
      <p class="field-error" v-if="themeError">{{ themeError }}</p>
    </fieldset>

    <div class="field">
      <label for="photo">Photo pour la couverture <span class="optional">(facultatif)</span></label>
      <div
        class="dropzone" :class="{ dragging, filled: form.photoUrl, busy: photoBusy }"
        @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop"
      >
        <template v-if="form.photoUrl">
          <img :src="form.photoUrl" alt="Aperçu de la photo choisie" class="photo-preview" />
          <div class="photo-meta">
            <strong>Photo ajoutée</strong>
            <span>Elle apparaîtra dans un médaillon sur la couverture.</span>
            <div class="photo-actions">
              <label class="btn btn-ghost btn-sm" for="photo">Changer</label>
              <button type="button" class="btn btn-ghost btn-sm" :disabled="loading" @click="removePhoto">Retirer</button>
            </div>
          </div>
        </template>
        <template v-else>
          <span class="drop-icon" aria-hidden="true">📷</span>
          <div class="photo-meta">
            <strong>{{ photoBusy ? 'Préparation de la photo…' : 'Glisse une photo ici' }}</strong>
            <span>ou <label for="photo" class="link">parcours tes fichiers</label> · JPEG, PNG</span>
          </div>
        </template>
        <input id="photo" ref="fileInput" type="file" accept="image/*" class="sr-only" :disabled="loading || photoBusy" @change="handleFile($event.target.files?.[0])" />
      </div>
      <p class="field-hint">
        La photo sert uniquement à la couverture, elle est traitée en mémoire et <strong>jamais conservée</strong>.
        Elle n’est pas utilisée pour dessiner les illustrations.
      </p>
      <p class="field-error" v-if="photoError">{{ photoError }}</p>
    </div>

    <div class="submit-row">
      <button class="btn btn-primary btn-lg" :disabled="loading || photoBusy" :aria-busy="loading">
        <span v-if="loading" class="spinner" aria-hidden="true"></span>
        {{ loading ? 'Création en cours…' : error ? 'Réessayer' : 'Créer mon histoire' }}
      </button>
      <span class="hint">Environ une minute pour un livre complet.</span>
    </div>
  </form>
</template>
