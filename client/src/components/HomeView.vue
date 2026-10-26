<script setup>
import { THEMES } from '../lib/themes.js';
defineEmits(['start']);

const steps = [
  { n: '1', title: 'Parlez-nous de votre enfant', text: 'Son prénom, son âge et le thème qui le fait rêver. Une photo pour la couverture, si vous le souhaitez.' },
  { n: '2', title: 'Plumio écrit son aventure', text: 'Une histoire complète en 10 chapitres, avec des personnages, une intrigue et une belle fin, adaptée à son âge.' },
  { n: '3', title: 'Téléchargez votre livre', text: 'Un PDF A4 illustré, prêt à lire sur écran, à imprimer ou à offrir.' }
];

const perks = [
  { icon: '📖', title: 'Un vrai livre', text: 'Couverture, 10 pages de récit illustrées et une mise en page soignée.' },
  { icon: '🎈', title: 'Adapté à l’âge', text: 'Le vocabulaire et la longueur des pages suivent l’âge de l’enfant.' },
  { icon: '🖨️', title: 'Prêt à imprimer', text: 'Format A4, marges d’impression et polices intégrées au fichier.' },
  { icon: '🔒', title: 'Photo non conservée', text: 'La photo sert uniquement à la couverture et n’est jamais stockée.' }
];
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Histoires personnalisées pour enfants</span>
        <h1>Une histoire où <em>votre enfant</em> est le héros</h1>
        <p class="lead">
          Plumio écrit et met en page un petit livre illustré qui porte son prénom, ses
          envies et son âge. Un cadeau qui se lit, se garde et se relit.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" @click="$emit('start')">Créer mon histoire <span aria-hidden="true">→</span></button>
          <span class="hint">Gratuit · Sans inscription · PDF en quelques instants</span>
        </div>
      </div>

      <div class="hero-art" aria-hidden="true">
        <div class="book-stack">
          <div class="book-card book-back"></div>
          <div class="book-card book-front">
            <div class="book-sky">
              <span class="moon"></span>
              <span class="hill hill-a"></span>
              <span class="hill hill-b"></span>
              <span class="spark s1">✦</span><span class="spark s2">✦</span><span class="spark s3">✦</span>
            </div>
            <div class="book-title">Lina et l’étoile qui avait perdu sa lumière</div>
            <div class="book-pill">Une histoire pour Lina</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Comment ça marche</h2>
      <ol class="steps">
        <li v-for="s in steps" :key="s.n" class="step card">
          <span class="step-n">{{ s.n }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ol>
    </section>

    <section class="section">
      <h2 class="section-title">Douze univers à explorer</h2>
      <div class="theme-strip">
        <button v-for="t in THEMES" :key="t.id" class="theme-chip" :class="`tone-${t.tone}`" @click="$emit('start', t.id)">
          <span class="theme-emoji">{{ t.emoji }}</span>
          <strong>{{ t.id }}</strong>
          <small>{{ t.tagline }}</small>
        </button>
      </div>
    </section>

    <section class="section">
      <div class="perks">
        <div v-for="p in perks" :key="p.title" class="perk">
          <span class="perk-icon" aria-hidden="true">{{ p.icon }}</span>
          <h3>{{ p.title }}</h3>
          <p>{{ p.text }}</p>
        </div>
      </div>
    </section>

    <section class="cta-band">
      <h2>Prêt à écrire la première page ?</h2>
      <p>Il suffit d’un prénom et d’un thème.</p>
      <button class="btn btn-primary btn-lg" @click="$emit('start')">Créer mon histoire</button>
    </section>
  </div>
</template>
