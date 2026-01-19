import characters from '../lib/gacha/characters.js'
import fetch from 'node-fetch'

const rollLocks = new Map()

function cleanOldLocks() {
  const now = Date.now()
  for (const [userId, lockTime] of rollLocks.entries()) {
    if (now - lockTime > 30000) rollLocks.delete(userId)
  }
}

function formatTag(tag) {
  return String(tag).trim().toLowerCase().replace(/\s+/g, '_')
}

async function fetchDanbooruImage(tag) {
  try {
    const query = encodeURIComponent(tag)
    const res = await fetch(`https://danbooru.donmai.us/posts.json?tags=${query}&limit=20`, {
      headers: { 'User-Agent': 'LapplandBot', Accept: 'application/json' }
    })
    if (!res.ok) return null
    const data = await res.json()
    const post = data.find(p => (p.file_url || p.large_file_url) && /\.(jpe?g|png)$/i.test(p.file_url || p.large_file_url))
    return post ? post.file_url || post.large_file_url : null
  } catch {
    return null
  }
}

export default {
  command: ['rollwaifu', 'rw', 'roll'],
  category: 'gacha',
  owner: false,
  admin: false,
  execute: async ({ sock, m, args }) => {
    const userId = m.sender
    const chatId = m.key.remoteJid

    cleanOldLocks()
    if (rollLocks.has(userId)) return
    rollLocks.set(userId, Date.now())

    try {
      const allChars = Object.values(characters)
      if (!allChars.length) return sock.sendMessage(chatId, { text: '❌ No hay personajes disponibles.' }, { quoted: m })

      const selected = allChars[Math.floor(Math.random() * allChars.length)]
      const baseTag = formatTag(selected.tags[0])
      const imageUrl = await fetchDanbooruImage(baseTag)

      if (!imageUrl) return sock.sendMessage(chatId, { text: `❌ No se encontró imagen para ${selected.name}.` }, { quoted: m })

      const msg = `❀ Nombre » *${selected.name}*
⚥ Género » *${selected.gender || 'Desconocido'}*
✰ Valor » *${selected.value || 100}*
❖ Serie » *${selected.series || 'Desconocida'}*`

      await sock.sendMessage(chatId, { image: { url: imageUrl }, caption: msg }, { quoted: m })
    } catch (e) {
      console.error('❌ Error en Gacha:', e)
      await sock.sendMessage(chatId, { text: '❌ Ocurrió un error al hacer roll.' }, { quoted: m })
    } finally {
      rollLocks.delete(userId)
    }
  }
}
