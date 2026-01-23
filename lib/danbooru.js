import fetch from 'node-fetch'

export async function getDanbooruImage(tags = []) {
  const tagString = tags.join(' ')
  const url = `https://danbooru.donmai.us/posts.json?limit=20&tags=${encodeURIComponent(tagString + ' rating:safe')}`

  const res = await fetch(url)
  const data = await res.json()

  if (!Array.isArray(data) || data.length === 0) return null

  const post = data.find(p => p.file_url && (p.file_ext === 'jpg' || p.file_ext === 'png'))
  return post?.file_url || null
}
