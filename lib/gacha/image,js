import fetch from 'node-fetch'

export async function getImage(tag) {
  try {
    const url = `https://danbooru.donmai.us/posts.json?limit=1&tags=${encodeURIComponent(tag)}`
    const r = await fetch(url, { timeout: 2500 })
    const j = await r.json()
    return j?.[0]?.file_url || null
  } catch {
    return null
  }
}
