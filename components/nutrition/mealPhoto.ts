// Client-side validation and compression for the meal photo flow. Ported from
// Tranmere Tracker. Downscaling before upload keeps token cost and latency down.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const COMPRESS_MAX_DIMENSION = 1024
export const COMPRESS_QUALITY = 0.8

export type ValidationResult = { ok: true } | { ok: false; error: string }

export function validateImageFile(file: File): ValidationResult {
  if (!file.type || !file.type.startsWith('image/')) {
    return { ok: false, error: 'That file is not an image. Take or upload a photo.' }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'That image is too large. Use a photo under 10 MB.' }
  }
  return { ok: true }
}

export async function compressImage(file: File, maxDimension = COMPRESS_MAX_DIMENSION, quality = COMPRESS_QUALITY): Promise<File> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file) } catch { return file }
  const { width, height } = bitmap
  const scale = Math.max(width, height) > maxDimension ? maxDimension / Math.max(width, height) : 1
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) { bitmap.close?.(); return file }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob || blob.size >= file.size) return file
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'meal'}.jpg`, { type: 'image/jpeg' })
}
