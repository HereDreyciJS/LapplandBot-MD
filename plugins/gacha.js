import fetch from 'node-fetch'
import characters from '../lib/gacha/characters.js'

const rollLocks = new Map()

function cleanLocks() {
  const now = Date.now()
  for (const [id, time] of rollLocks.entries()) {
    if (now - time > 30_000) rollLocks.delete(id)
  }
}

function formatTag(tag) {
  return String(tag).trim().toLowerCase().replace(/\s+/g, '_')
}

async function searchDanbooru(tag) {
  const query = encodeURIComponent(tag)
  const url = `https://danbooru.donmai.us/posts.json?tags=${query}&limit=10`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Bot' } })
    if (!res.ok) return []
    const json = await res.json()
    return json
      .filter(p => p.file_url && /\.(jpg|jpeg|png)$/i.test(p.file_url))
      .map(p => p.file_url)
  } catch {
    return []
  }
}

export default {
  command: ['rw', 'rollwaifu'],
  category: 'gacha',
  execute: async ({ sock, m }) => {
    const userId = m.sender
    const chatId = m.chat

    cleanLocks()
    if (rollLocks.has(userId)) return
    rollLocks.set(userId, Date.now())

    const charKeys = Object.keys(characters)
    if (!charKeys.length) {
      rollLocks.delete(userId)
      return sock.sendMessage(chatId, { text: 'No hay personajes disponibles.' }, { quoted: m })
    }

    const selectedKey = charKeys[Math.floor(Math.random() * charKeys.length)]
    const char = characters[selectedKey]

    const tag = char.tags[0]
    const images = await searchDanbooru(tag)
    const image = images[Math.floor(Math.random() * images.length)]

    if (!image) {
      rollLocks.delete(userId)
      return sock.sendMessage(chatId, { text: `No se encontraron imágenes para ${char.name}.` }, { quoted: m })
    }

    const user = global.db.getUser(userId)
    const claimed = user.harem?.[selectedKey] ? `Reclamada por ti` : 'Libre'

    const text = `❀ Nombre: *${char.name}*
⚥ Género: *${char.gender}*
✦ Serie: *${tag.replace('_', ' ')}*
☆ Valor: *${char.value}*
♡ Estado: *${claimed}*
➡ Responde a este mensaje con */claim* para reclamarla.`

    const sent = await sock.sendMessage(chatId, { image: { url: image }, caption: text }, { quoted: m })

    global.db.data.tempClaims ||= {}
    global.db.data.tempClaims[sent.key.id] = selectedKey

    rollLocks.delete(userId)
  }
}
