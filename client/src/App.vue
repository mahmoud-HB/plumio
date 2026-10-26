<script setup>
import { ref, nextTick } from 'vue';
import HomeView from './components/HomeView.vue';
import StoryForm from './components/StoryForm.vue';
import LoadingBook from './components/LoadingBook.vue';
import BookResult from './components/BookResult.vue';
import GamesView from './components/GamesView.vue';
import { generateBook } from './lib/api.js';

const page = ref('home'); // 'home' | 'create' | 'games'
const menuOpen = ref(false);
const status = ref('idle'); // 'idle' | 'loading' | 'done'
const error = ref('');
const result = ref(null);
const submitted = ref({ name: '', theme: '', photoUrl: '' });
const form = ref({ name: '', age: 7, theme: '', photo: null, photoUrl: '' });

function go(target, theme) {
  if (theme) form.value = { ...form.value, theme };
  page.value = target;
  menuOpen.value = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function submit() {
  if (status.value === 'loading') return; // évite les envois multiples
  error.value = '';
  status.value = 'loading';
  const snapshot = { ...form.value, name: form.value.name.trim() };
  window.scrollTo({ top: 0, behavior: 'smooth' });
  try {
    result.value = await generateBook(snapshot);
    submitted.value = { name: snapshot.name, theme: snapshot.theme, photoUrl: snapshot.photoUrl };
    status.value = 'done';
  } catch (e) {
    error.value = e.message || 'Une erreur est survenue.';
    status.value = 'idle';
  }
  await nextTick();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function edit() {
  status.value = 'idle';
}
function again() {
  form.value = { name: '', age: 7, theme: '', photo: null, photoUrl: '' };
  result.value = null;
  status.value = 'idle';
}
</script>

<template>
  <div class="app">
    <header class="site-header">
      <div class="wrap header-inner">
        <a href="#" class="brand" @click.prevent="go('home')" aria-label="Plumio, accueil">
          <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
            <rect width="40" height="40" rx="12" fill="#7c62c9" />
            <path d="M27.5 9c-7.5.8-12.8 5.6-14.4 13.2L11 30l2.2-.5c1.7-.4 3.1-1 4.4-2l2.5.3-1.2-2.2c3.7-.3 7.2-3.3 8.5-8.4l1.2-4.2-3.2 1c.3-1.1.6-2.1.9-3.1z" fill="#fff" />
          </svg>
          <span class="brand-name">Plumio</span>
        </a>

        <nav class="nav" :class="{ open: menuOpen }" aria-label="Navigation principale">
          <a href="#" :class="{ active: page === 'home' }" @click.prevent="go('home')">Accueil</a>
          <a href="#" :class="{ active: page === 'create' }" @click.prevent="go('create')">Créer une histoire</a>
          <a href="#" :class="{ active: page === 'games' }" @click.prevent="go('games')">Jeux à imprimer</a>
        </nav>

        <div class="header-actions">
          <button class="btn btn-primary btn-sm cta-desktop" @click="go('create')">Créer mon histoire</button>
          <button class="hamburger" :aria-expanded="menuOpen" aria-label="Menu" @click="menuOpen = !menuOpen">
            <span :class="{ open: menuOpen }"></span>
          </button>
        </div>
      </div>
    </header>

    <main class="wrap main">
      <HomeView v-if="page === 'home'" @start="(t) => go('create', typeof t === 'string' ? t : '')" @games="go('games')" />

      <GamesView v-else-if="page === 'games'" />

      <template v-else>
        <LoadingBook v-if="status === 'loading'" :name="form.name.trim()" />
        <BookResult
          v-else-if="status === 'done' && result"
          :result="result" :child-name="submitted.name" :theme="submitted.theme" :photo-url="submitted.photoUrl"
          @edit="edit" @again="again"
        />
        <StoryForm v-else v-model="form" :loading="false" :error="error" @submit="submit" @dismiss-error="error = ''" />
      </template>
    </main>

    <footer class="site-footer">
      <div class="wrap">
        <span class="brand-name small">Plumio</span>
        <span>Des histoires pour faire grandir l’imagination · Les photos ne sont jamais conservées</span>
      </div>
    </footer>
  </div>
</template>
