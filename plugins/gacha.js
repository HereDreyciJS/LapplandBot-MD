import fetch from 'node-fetch'
import characters from '../lib/characters.js'

const rollLocks = new Map()

function cleanOldLocks() {
  const now = Date.now()
  for (const [userId, lockTime] of rollLocks.entries()) {
    if (now - lockTime > 30000) rollLocks.delete(userId)
  }
}

async function buscarImagenDanbooru(tag) {
  try {
    const query = encodeURIComponent(tag)
    const res = await fetch(`https://danbooru.donmai.us/posts.json?tags=${query}&limit=20`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    if (!res.ok) return []
    const data = await res.json()
    return data
      .filter(post => (post.file_url || post.large_file_url) && /\.(jpg|jpeg|png)$/i.test(post.file_url || post.large_file_url))
      .map(post => post.file_url || post.large_file_url)
  } catch {
    return []
  }
}

export default {
  command: ['rollwaifu', 'rw', 'roll'],
  category: 'gacha',
  execute: async ({ sock, m }) => {
    const userId = m.key.participant || m.key.remoteJid
    cleanOldLocks()
    if (rollLocks.has(userId)) return
    rollLocks.set(userId, Date.now())

    const allCharacters = Object.values(characters).filter(c => c && c.name)
    if (!allCharacters.length) {
      rollLocks.delete(userId)
      return sock.sendMessage(m.key.remoteJid, { text: '❌ No hay personajes disponibles.' }, { quoted: m })
    }

    const selected = allCharacters[Math.floor(Math.random() * allCharacters.length)]
    const tag = Array.isArray(selected.tags) && selected.tags.length ? selected.tags[0] : selected.name
    const images = await buscarImagenDanbooru(tag)

    if (!images.length) {
      rollLocks.delete(userId)
      return sock.sendMessage(m.key.remoteJid, { text: `❌ No se encontraron imágenes para ${selected.name}.` }, { quoted: m })
    }

    const media = images[Math.floor(Math.random() * images.length)]
    const msgText = `❀ Nombre » *${selected.name}*\n⚥ Género » *${selected.gender || 'Desconocido'}*\n✰ Valor » *${selected.value || 100}*`
    await sock.sendMessage(m.key.remoteJid, { image: { url: media }, caption: msgText }, { quoted: m })

    rollLocks.delete(userId)
  }
}
