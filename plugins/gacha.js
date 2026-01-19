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

async function fetchDanbooruImages(tag) {
  try {
    const query = encodeURIComponent(tag)
    const res = await fetch(`https://danbooru.donmai.us/posts.json?tags=${query}&limit=50`, {
      headers: { 'User-Agent': 'LapplandBot', Accept: 'application/json' }
    })
    if (!res.ok) return []

    const data = await res.json()
    return data
      .map(p => p.file_url || p.large_file_url)
      .filter(url => url && /\.(jpe?g|png)$/i.test(url))
  } catch {
    return []
  }
}

export default {
  command: ['rollwaifu', 'rw', 'roll'],
  category: 'gacha',
  owner: false,
  admin: false,
  execute: async ({ sock, m }) => {
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
      const images = await fetchDanbooruImages(baseTag)

      if (!images.length) return sock.sendMessage(chatId, { text: `❌ No se encontraron imágenes para ${selected.name}.` }, { quoted: m })

      const imageUrl = images[Math.floor(Math.random() * images.length)]

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
