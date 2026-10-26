<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { base64ToBlob } from '../lib/media.js';
import { THEMES } from '../lib/themes.js';

const props = defineProps({
  result: { type: Object, required: true },
  childName: { type: String, required: true },
  theme: { type: String, required: true },
  photoUrl: { type: String, default: '' }
});
defineEmits(['edit', 'again']);

const index = ref(-1); // -1 = couverture
const downloaded = ref(false);
const pdfUrl = ref('');

const pages = computed(() => props.result.story.pages);
const tone = computed(() => THEMES.find((t) => t.id === props.theme)?.tone ?? 'forest');
const current = computed(() => (index.value >= 0 ? pages.value[index.value] : null));
const label = computed(() => (index.value < 0 ? 'Couverture' : `Page ${index.value + 1} sur ${pages.value.length}`));

function ensureUrl() {
  if (!pdfUrl.value) pdfUrl.value = URL.createObjectURL(base64ToBlob(props.result.pdfBase64));
  return pdfUrl.value;
}

function download() {
  const a = document.createElement('a');
  a.href = ensureUrl();
  a.download = props.result.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  downloaded.value = true;
}

function openTab() {
  window.open(ensureUrl(), '_blank', 'noopener');
}

const go = (d) => { index.value = Math.max(-1, Math.min(pages.value.length - 1, index.value + d)); };

onBeforeUnmount(() => pdfUrl.value && URL.revokeObjectURL(pdfUrl.value));
</script>

<template>
  <section class="result">
    <div class="result-head">
      <span class="badge badge-success"><span aria-hidden="true">✓</span> Ton livre est prêt</span>
      <h1>{{ result.story.title }}</h1>
      <p class="lead">{{ result.pageCount }} pages · format A4 · prêt à lire ou à imprimer</p>
    </div>

    <div v-for="w in result.warnings" :key="w" class="notice notice-info" role="status">
      <span class="notice-icon" aria-hidden="true">i</span>
      <p>{{ w }}</p>
    </div>

    <div class="result-layout">
      <div class="viewer">
        <div class="page-sheet" :class="[`tone-${tone}`, { 'is-cover': index < 0 }]">
          <template v-if="!current">
            <div class="sheet-art"><span class="sheet-emoji" aria-hidden="true">{{ THEMES.find((t) => t.id === theme)?.emoji }}</span></div>
            <img v-if="photoUrl" :src="photoUrl" alt="" class="sheet-photo" />
            <h2>{{ result.story.title }}</h2>
            <p class="sheet-sub">{{ result.story.subtitle }}</p>
            <span class="book-pill">Une histoire pour {{ childName }}</span>
          </template>
          <template v-else>
            <h3>{{ current.title }}</h3>
            <p class="sheet-text">{{ current.text }}</p>
            <span class="sheet-folio">— {{ current.n }} —</span>
          </template>
        </div>
        <div class="viewer-nav">
          <button class="icon-btn" :disabled="index < 0" aria-label="Page précédente" @click="go(-1)">‹</button>
          <span>{{ label }}</span>
          <button class="icon-btn" :disabled="index >= pages.length - 1" aria-label="Page suivante" @click="go(1)">›</button>
        </div>
        <p class="field-hint center">Aperçu du texte. Les illustrations sont dans le PDF.</p>
      </div>

      <aside class="result-side card">
        <p class="intro" v-if="result.story.intro">« {{ result.story.intro }} »</p>
        <button class="btn btn-primary btn-lg btn-block" @click="download">
          <span aria-hidden="true">⬇</span> Télécharger le PDF
        </button>
        <button class="btn btn-ghost btn-block" @click="openTab">Ouvrir dans un nouvel onglet</button>
        <p v-if="downloaded" class="notice notice-success inline" role="status">Téléchargement lancé : retrouve <strong>{{ result.fileName }}</strong> dans tes fichiers.</p>
        <ul class="facts">
          <li><span>Écrit par</span><strong>{{ result.mode === 'ai' ? 'IA, relue automatiquement' : 'Bibliothèque Plumio' }}</strong></li>
          <li><span>Illustrations</span><strong>{{ result.illustrated > 0 ? `${result.illustrated} images IA` : 'Illustrations du thème' }}</strong></li>
          <li><span>Pages</span><strong>Couverture + 10 chapitres</strong></li>
        </ul>
        <div class="side-actions">
          <button class="btn btn-ghost btn-sm" @click="$emit('edit')">Modifier les informations</button>
          <button class="btn btn-ghost btn-sm" @click="$emit('again')">Nouvelle histoire</button>
        </div>
      </aside>
    </div>
  </section>
</template>
