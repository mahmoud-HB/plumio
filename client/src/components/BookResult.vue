<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { base64ToBlob } from '../lib/media.js';
import { THEMES } from '../lib/themes.js';
import { buildSegments, createNarrator, frenchVoices, speechSupported } from '../lib/narrator.js';

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

// Lecture audio (synthèse vocale du navigateur, gratuite, sans fichier à télécharger)
const canSpeak = speechSupported();
const audioState = ref('idle');
const audioProgress = ref(0);
const voices = ref([]);
const voiceURI = ref('');
const rate = ref(0.85);
let narrator = null;

function loadVoices() {
  voices.value = frenchVoices();
  if (!voiceURI.value && voices.value.length) voiceURI.value = voices.value[0].voiceURI;
  narrator?.set({ voiceURI: voiceURI.value });
}

onMounted(() => {
  if (!canSpeak) return;
  const segments = buildSegments(props.result.story);
  narrator = createNarrator(segments, {
    onSegment: (i, seg) => { index.value = seg.page; audioProgress.value = i / segments.length; },
    onState: (st) => { audioState.value = st; if (st === 'idle') audioProgress.value = 0; }
  });
  loadVoices();
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
});

function toggleAudio() {
  if (!narrator) return;
  if (audioState.value === 'playing') narrator.pause();
  else if (audioState.value === 'paused') narrator.resume();
  else narrator.play(0);
}
const stopAudio = () => narrator?.stop();
const onVoice = () => narrator?.set({ voiceURI: voiceURI.value });
const onRate = () => narrator?.set({ rate: Number(rate.value) });

const go = (d) => {
  index.value = Math.max(-1, Math.min(pages.value.length - 1, index.value + d));
  narrator?.seekPage(index.value);
};

onBeforeUnmount(() => {
  pdfUrl.value && URL.revokeObjectURL(pdfUrl.value);
  if (canSpeak) { narrator?.stop(); window.speechSynthesis.removeEventListener('voiceschanged', loadVoices); }
});
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
        <div class="audio-card">
          <div class="audio-title"><span aria-hidden="true">🎧</span> Écouter l’histoire</div>
          <template v-if="canSpeak">
            <div class="audio-controls">
              <button class="btn btn-soft" :aria-label="audioState === 'playing' ? 'Mettre en pause' : 'Lire l’histoire'" @click="toggleAudio">
                {{ audioState === 'playing' ? '❚❚ Pause' : audioState === 'paused' ? '▶ Reprendre' : '▶ Écouter' }}
              </button>
              <button class="btn btn-ghost btn-sm" :disabled="audioState === 'idle'" @click="stopAudio">■ Arrêter</button>
            </div>
            <div class="audio-bar" role="progressbar" aria-label="Progression de la lecture" :aria-valuenow="Math.round(audioProgress * 100)" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: audioProgress * 100 + '%' }"></span></div>
            <div class="audio-options">
              <label v-if="voices.length > 1">Voix
                <select v-model="voiceURI" @change="onVoice"><option v-for="(v, i) in voices" :key="v.voiceURI" :value="v.voiceURI">{{ v.name }}{{ i === 0 ? ' (recommandée)' : '' }}</option></select>
              </label>
              <label>Rythme
                <select v-model="rate" @change="onRate"><option :value="0.75">Très douce</option><option :value="0.85">Histoire du soir</option><option :value="0.95">Normale</option></select>
              </label>
            </div>
            <p class="field-hint">Voix douce avec pauses de conteur, lue par ton appareil (aucun fichier à télécharger). Pour la plus belle voix : Edge (voix « Natural »), Safari ou un iPhone/Mac avec une voix française « améliorée » installée.</p>
          </template>
          <p v-else class="field-hint">La lecture audio n’est pas disponible sur ce navigateur. Essaie Chrome, Edge ou Safari.</p>
        </div>
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
