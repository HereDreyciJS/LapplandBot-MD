import fetch from 'node-fetch'
import characters from '../lib/gacha/characters.js'

const rollLocks = new Map()

function cleanOldLocks() {
  const now = Date.now()
  for (const [userId, lockTime] of rollLocks.entries()) {
    if (now - lockTime > 30000) rollLocks.delete(userId)
  }
}

async function buscarImagenDanbooru(tag) {
  const query = encodeURIComponent(tag)
  try {
    const res = await fetch(`https://danbooru.donmai.us/posts.json?tags=${query}&limit=10`)
    const data = await res.json()
    const images = data
      .filter(post => (post.file_url || post.large_file_url) && /\.(jpg|jpeg|png)$/i.test(post.file_url || post.large_file_url))
      .map(post => post.file_url || post.large_file_url)
    return images
  } catch {
    return []
  }
}

export default {
  command: ['rollwaifu', 'rw', 'roll'],
  category: 'gacha',
  execute: async ({ sock, m, text }) => {
    cleanOldLocks()
    const userId = m.sender

    if (rollLocks.has(userId)) return
    rollLocks.set(userId, Date.now())

    const keys = Object.keys(characters)
    if (!keys.length) return sock.sendMessage(m.key.remoteJid, { text: 'No hay personajes disponibles.' }, { quoted: m })

    const selectedKey = keys[Math.floor(Math.random() * keys.length)]
    const selected = characters[selectedKey]

    const baseTag = selected.tags[0]
    const mediaList = await buscarImagenDanbooru(baseTag)
    if (!mediaList.length) {
      rollLocks.delete(userId)
      return sock.sendMessage(m.key.remoteJid, { text: `No se encontraron imágenes para ${selected.name}.` }, { quoted: m })
    }

    const media = mediaList[Math.floor(Math.random() * mediaList.length)]

    const msg = `❀ Nombre » *${selected.name}*\n⚥ Género » *${selected.gender}*\n✰ Valor » *${selected.value}*`
    await sock.sendMessage(m.key.remoteJid, { image: { url: media }, caption: msg }, { quoted: m })

    rollLocks.delete(userId)
  }
}
