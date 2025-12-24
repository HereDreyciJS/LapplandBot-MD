const BASE = process.env.MEDIA_REPO

export function media(path) {
  if (!BASE) return null
  return `${BASE}/${path}`
}
