import fetch from 'node-fetch'
import { promises as fs } from 'fs'

const FILE_PATH = './lib/characters.json'
const rollLocks = new Map()

function cleanOldLocks() {
  const now = Date.now()
  for (const [userId, lockTime] of rollLocks.entries()) {
    if (now - lockTime > 30000) rollLocks.delete(userId)
  }
}

async function loadCharacters() {
  try {
    await fs.access(FILE_PATH)
  } catch {
    await fs.writeFile(FILE_PATH, '{}')
  }
  const raw = await fs.readFile(FILE_PATH, 'utf-8')
  return JSON.parse(raw)
}

function flattenCharacters(db) {
  return Object.values(db).flatMap(s => Array.isArray(s.characters) ? s.characters : [])
}

function formatTag(tag) {
  return String(tag).trim().toLowerCase().replace(/\s+/g, '_')
}

async function fetchDanbooruImage(tag) {
  try {
    const query = encodeURIComponent(formatTag(tag))
    const url = `https://danbooru.donmai.us/posts.json?tags=${query}&limit=10`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    })
    if (!res.ok) return null
    const data = await res.json()
    const images = data
      .filter(post => (post.file_url || post.large_file_url) && /\.(jpg|jpeg|png)$/i.test(post.file_url || post.large_file_url))
      .map(post => post.file_url || post.large_file_url)
    if (images.length === 0) return null
    return images[Math.floor(Math.random() * images.length)]
  } catch {
    return null
  }
}

export default {
  command: ['rollwaifu', 'rw', 'roll'],
  category: 'gacha',
  execute: async ({ sock, m, args, command, prefix }) => {
    const userId = m.key.participant || m.key.remoteJid
    cleanOldLocks()
    if (rollLocks.has(userId)) {
      const now = Date.now()
      if (now - rollLocks.get(userId) < 15000) return
      rollLocks.delete(userId)
    }

    const db = await loadCharacters()
    const allCharacters = flattenCharacters(db)
    if (allCharacters.length === 0) return await sock.sendMessage(m.key.remoteJid, { text: '❌ No hay personajes disponibles.' }, { quoted: m })

    const selected = allCharacters[Math.floor(Math.random() * allCharacters.length)]
    const media = await fetchDanbooruImage(selected.tags?.[0] || selected.name)
    if (!media) return await sock.sendMessage(m.key.remoteJid, { text: `❌ No se encontraron imágenes para *${selected.name}*.` }, { quoted: m })

    const msg = `❀ Nombre » *${selected.name}*\n⚥ Género » *${selected.gender || 'Desconocido'}*`

    await sock.sendMessage(m.key.remoteJid, {
      image: { url: media },
      caption: msg
    }, { quoted: m })

    rollLocks.set(userId, Date.now())
  }
}
