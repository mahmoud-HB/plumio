<template>
  <div id="app">
    <header class="nav modern">
      <div class="nav-inner">
        <div class="brand-row">
          <div class="logo">P</div>
          <div>
            <h1 class="brand">Plumio</h1>
            <div class="tag">Histoires personnalisées pour enfants</div>
          </div>
        </div>

        <nav class="desktop-nav">
          <a href="#" :class="{ active: page === 'home' }" @click.prevent="page = 'home'">Accueil</a>
          <a href="#" :class="{ active: page === 'generator' }" @click.prevent="page = 'generator'">Générateur</a>
        </nav>

        <div class="actions">
          <button class="ghost" @click="page='generator'">Créer</button>
          <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="Menu">
            <span :class="{ open: menuOpen }"></span>
          </button>
        </div>
      </div>

      <div class="mobile-nav" v-if="menuOpen">
        <a href="#" :class="{ active: page === 'home' }" @click.prevent="page = 'home'; menuOpen=false">Accueil</a>
        <a href="#" :class="{ active: page === 'generator' }" @click.prevent="page = 'generator'; menuOpen=false">Générateur</a>
      </div>
    </header>

    <main class="main">
      <section v-if="page === 'home'" class="home card">
        <h2>Bienvenue sur Plumio</h2>
        <p>
          Créez des histoires personnalisées pour les enfants en quelques clics.
          Utilisez la page "Générateur" pour entrer un nom, choisir un thème et
          uploader une photo. Vous récupérerez un PDF prêt à imprimer.
        </p>
        <div style="margin-top:16px;">
          <button @click="page = 'generator'">Aller au générateur</button>
        </div>
      </section>

      <section v-if="page === 'generator'" class="card">
        <h1>Générateur d’histoires pour enfants ✨</h1>
        <p style="margin-top: 0">
          Crée une histoire personnalisée en PDF avec le nom, un thème, et une photo.
        </p>

        <form @submit.prevent="onSubmit">
          <label for="name">Nom de l’enfant</label>
          <input id="name" type="text" v-model="name" placeholder="Ex: Lina" required />

          <label for="theme">Thème de l’histoire</label>
          <select id="theme" v-model="theme" required>
            <option disabled value="">Choisir un thème</option>
            <option>Espace</option>
            <option>Forêt magique</option>
            <option>Pirates</option>
            <option>Super-héros</option>
            <option>Licornes</option>
          </select>

          <label for="photo">Photo de l’enfant (optionnelle)</label>
          <input id="photo" type="file" accept="image/*" @change="onFile" />

          <div style="margin-top: 18px; display: flex; gap: 12px; align-items: center;">
            <button :disabled="loading">{{ loading ? 'Génération en cours...' : 'Créer mon histoire' }}</button>
            <span v-if="loading">Cela peut prendre ~20–40s (texte + images)...</span>
          </div>

          <div v-if="error" class="notice">
            {{ error }}
          </div>

          <div v-if="success" class="notice success">
            Ton histoire est prête ✨
            <button style="margin-left: 12px; background: #10b981" @click.prevent="download">
              Télécharger le PDF
            </button>
          </div>
        </form>
      </section>
    </main>

    <footer class="footer">
      <small>Plumio — Générateur d'histoires (MVP)</small>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Utilise le proxy Vite: on appelle simplement la route relative
const API_URL = '/api/generate';

const page = ref('home'); // 'home' | 'generator'
const name = ref('');
const theme = ref('');
const file = ref(null);
const menuOpen = ref(false);

const loading = ref(false);
const error = ref('');
const success = ref(false);
const blobUrl = ref('');

function onFile(e) {
  const f = e.target.files?.[0] || null;
  file.value = f;
}

async function onSubmit() {
  error.value = '';
  success.value = false;
  blobUrl.value = '';
  if (!name.value || !theme.value) {
    error.value = 'Veuillez renseigner le nom et le thème.';
    return;
  }
  const form = new FormData();
  form.set('name', name.value);
  form.set('theme', theme.value);
  if (file.value) {
    form.set('photo', file.value);
  }

  loading.value = true;
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: form
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'Erreur serveur');
    }
    const blob = await res.blob();
    blobUrl.value = URL.createObjectURL(blob);
    success.value = true;
  } catch (e) {
    error.value = e.message || 'Une erreur est survenue.';
  } finally {
    loading.value = false;
  }
}

function download() {
  if (!blobUrl.value) return;
  const a = document.createElement('a');
  a.href = blobUrl.value;
  a.download = `histoire-${name.value || 'enfant'}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
</script>

<style>
:root{
  --bg:#0f172a;
  --card:#0b1220;
  --muted:#94a3b8;
  --accent:#7c3aed;
  --glass: rgba(255,255,255,0.04);
}

*{box-sizing:border-box}
body, #app { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background: linear-gradient(180deg,#071025 0%, #04122b 100%); color: #e6eef8; margin:0; min-height:100vh; }

.nav.modern{ background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-bottom: 1px solid rgba(255,255,255,0.03); position:sticky; top:0; z-index:30 }
.nav-inner{ max-width:980px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:14px 18px; }
.brand-row{ display:flex; gap:12px; align-items:center }
.logo{ width:48px; height:48px; border-radius:10px; background: linear-gradient(135deg,var(--accent), #5b21b6); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.2rem; color:white }
.brand{ margin:0; font-size:1.05rem }
.tag{ font-size:0.78rem; color:var(--muted) }

.desktop-nav a{ margin-left:14px; text-decoration:none; color:var(--muted); padding:8px 12px; border-radius:8px; }
.desktop-nav a.active{ color:white; background: rgba(124,58,237,0.15) }

.actions{ display:flex; gap:10px; align-items:center }
.ghost{ background:transparent; border:1px solid rgba(255,255,255,0.06); color:var(--muted); padding:8px 12px; border-radius:8px }
.hamburger{ width:42px; height:38px; background:transparent; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer }
.hamburger span{ position:relative; width:22px; height:2px; background:var(--muted); display:block }
.hamburger span::before, .hamburger span::after{ content:''; position:absolute; left:0; right:0; height:2px; background:var(--muted); transition:transform .22s, top .22s, opacity .22s }
.hamburger span::before{ top:-7px }
.hamburger span::after{ top:7px }
.hamburger span.open{ background:transparent }
.hamburger span.open::before{ transform: rotate(45deg); top:0 }
.hamburger span.open::after{ transform: rotate(-45deg); top:0 }

.mobile-nav{ display:none }
@media (max-width:720px){
  .desktop-nav{ display:none }
  .mobile-nav{ display:flex; flex-direction:column; gap:6px; padding:10px 18px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); }
  .mobile-nav a{ color:var(--muted); padding:10px; border-radius:8px; text-decoration:none }
  .mobile-nav a.active{ background: rgba(124,58,237,0.12); color:white }
}

.main{ max-width:980px; margin:28px auto; padding:0 18px; }
.card{ background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:22px; border-radius:12px; box-shadow: 0 6px 18px rgba(2,6,23,0.6); border: 1px solid rgba(255,255,255,0.03) }

label{ display:block; margin-top:12px; font-size:0.9rem; color:var(--muted) }
input[type="text"], select, input[type="file"]{ width:100%; padding:10px 12px; margin-top:6px; border-radius:10px; border:1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.02); color: #e6eef8 }
button{ background:var(--accent); color:white; border:none; padding:10px 14px; border-radius:10px; cursor:pointer }
button:disabled{ opacity:0.6; cursor:default }
.notice{ margin-top:12px; padding:12px; background: rgba(255,255,255,0.02); border-radius:8px; color:var(--muted) }
.notice.success{ background: linear-gradient(90deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03)); color:#bbf7d0 }

.footer{ max-width:980px; margin:22px auto; text-align:center; color:var(--muted); font-size:0.85rem }
</style>