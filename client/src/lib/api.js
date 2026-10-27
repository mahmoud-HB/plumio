const TIMEOUT_MS = 290_000;

function friendlyError(status) {
  if (status === 413) return 'La photo est trop lourde. Essaie avec une photo plus petite.';
  if (status === 504 || status === 408) return 'La création a pris trop de temps. Réessaie dans un instant.';
  if (status >= 500) return 'Le service est momentanément indisponible. Réessaie dans un instant.';
  return 'Une erreur est survenue. Réessaie dans un instant.';
}

/** Appelle l'API ; lève une Error au message lisible. Rien n'est simulé : en cas d'échec, l'appelant affiche l'erreur. */
export async function generateBook({ name, theme, age, photo }) {
  const form = new FormData();
  form.set('name', name);
  form.set('theme', theme);
  form.set('age', String(age));
  if (photo) form.set('photo', photo, 'photo.jpg');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch('/api/generate', { method: 'POST', body: form, signal: controller.signal });
  } catch (e) {
    throw new Error(e?.name === 'AbortError'
      ? 'La création a pris trop de temps. Réessaie dans un instant.'
      : 'Impossible de joindre le serveur. Vérifie ta connexion et réessaie.');
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || friendlyError(res.status));
  if (!data.pdfBase64) throw new Error('Le livre est arrivé incomplet. Réessaie.');
  return data;
}

/** Télécharge un PDF de jeux (un jeu ou toute la tranche d'âge) ; renvoie un Blob. */
export async function fetchGamesPdf({ name, age, theme, gameId = 'all', variant = 0, solution = false, level = 0 }) {
  let res;
  try {
    res = await fetch('/api/games/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age: Number(age), theme: theme || undefined, gameId, variant, solution, level: Number(level) })
    });
  } catch {
    throw new Error('Impossible de joindre le serveur. Vérifie ta connexion et réessaie.');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || friendlyError(res.status));
  }
  return res.blob();
}

export async function fetchGamesCatalog() {
  let res;
  try {
    res = await fetch('/api/games/catalog');
  } catch {
    throw new Error('Impossible de charger la liste des jeux. Vérifie ta connexion.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error('Impossible de charger la liste des jeux. Réessaie dans un instant.');
  return data;
}

/** La voix haute qualité (Google TTS) est-elle activée côté serveur ? Jamais bloquant. */
export async function fetchAudioStatus() {
  try {
    const res = await fetch('/api/audio/status');
    const data = await res.json();
    return Boolean(res.ok && data?.available);
  } catch {
    return false;
  }
}

/** Génère le MP3 de l’histoire ; renvoie un Blob. */
export async function fetchStoryAudio(story) {
  let res;
  try {
    res = await fetch('/api/audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ story: { title: story.title, subtitle: story.subtitle, pages: story.pages.map((p) => ({ title: p.title, text: p.text })) } })
    });
  } catch {
    throw new Error('Impossible de joindre le serveur. Vérifie ta connexion et réessaie.');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || friendlyError(res.status));
  }
  return res.blob();
}
