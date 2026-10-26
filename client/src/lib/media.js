const MAX_SIDE = 1200;

/** Redimensionne et convertit la photo en JPEG dans le navigateur (HEIC/WebP/PNG lourds -> JPEG léger, sous la limite de 4,5 Mo de Vercel). */
export async function prepareImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Ce fichier n’est pas une image.');
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Cette image ne peut pas être lue. Essaie une photo JPEG ou PNG.');
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
  if (!blob) throw new Error('La photo n’a pas pu être préparée.');
  return { blob, url: URL.createObjectURL(blob) };
}

export function base64ToBlob(b64, type = 'application/pdf') {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}
