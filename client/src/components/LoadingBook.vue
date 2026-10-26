<script setup>
defineProps({ name: String });
</script>

<template>
  <section class="loading card" role="status" aria-live="polite">
    <div class="loader-book" aria-hidden="true">
      <span class="lb-cover"></span>
      <span class="lb-page p1"></span>
      <span class="lb-page p2"></span>
      <span class="lb-page p3"></span>
    </div>
    <h2>Le livre de {{ name }} est en cours de préparation</h2>
    <p class="lead">Nous écrivons l’histoire, préparons les illustrations et mettons en page les 10 chapitres.</p>
    <ul class="loading-list">
      <li>Écriture de l’histoire</li>
      <li>Illustrations</li>
      <li>Mise en page du PDF</li>
    </ul>
    <p class="hint">Cela peut prendre jusqu’à une minute. Garde cette page ouverte.</p>
  </section>
</template>
