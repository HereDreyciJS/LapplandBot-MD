import fetch from 'node-fetch'
import characters from '../lib/gacha/characters.js'

const rollLocks = new Map()

function cleanOldLocks() {
  const now = Date.now()
  for (const [userId, lockTime] of rollLocks.entries()) {
    if (now - lockTime > 30000) rollLocks.delete(userId)
  }
}

function formatTag(tag) {
  return String(tag).trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '')
}

async function buscarImagenDanbooru(tag) {
  const query = encodeURIComponent(tag)
  const url = `https://danbooru.donmai.us/posts.json?tags=${query}&limit=20`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' }
    })
    if (!res.ok) return []
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
  execute: async ({ sock, m, args, prefix, command }) => {
    const userId = m.key.participant || m.key.remoteJid
    const chatId = m.key.remoteJid

    cleanOldLocks()
    if (rollLocks.has(userId)) return
    rollLocks.set(userId, Date.now())

    if (!characters.length) {
      return sock.sendMessage(chatId, { text: '❌ No hay personajes disponibles.' }, { quoted: m })
    }

    const selected = characters[Math.floor(Math.random() * characters.length)]
    const tag = selected.tags?.[0]
    if (!tag) return sock.sendMessage(chatId, { text: `❌ El personaje ${selected.name} no tiene tag válido.` }, { quoted: m })

    const formattedTag = formatTag(tag)
    const images = await buscarImagenDanbooru(formattedTag)
    if (!images.length) {
      return sock.sendMessage(chatId, { text: `❌ No se encontraron imágenes para ${selected.name}.` }, { quoted: m })
    }

    const media = images[Math.floor(Math.random() * images.length)]
    const msgText = `❀ Nombre » *${selected.name}*\n⚥ Género » *${selected.gender || 'Desconocido'}*`
    await sock.sendMessage(chatId, { image: { url: media }, caption: msgText }, { quoted: m })

    rollLocks.delete(userId)
  }
}
