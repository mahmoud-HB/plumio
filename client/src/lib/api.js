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
