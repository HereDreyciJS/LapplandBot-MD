import characters from '../lib/gacha/characters.js'
import fetch from 'node-fetch'

async function getDanbooruImage(tags) {
  if (!tags || !tags.length) return null
  const tag = tags[Math.floor(Math.random() * tags.length)]
  const query = encodeURIComponent(tag)
  const url = `https://danbooru.donmai.us/posts.json?tags=${query}&limit=20`
  try {
    const res = await fetch(url)
    const json = await res.json()
    const images = json
      .filter(post => (post.file_url || post.large_file_url) && /\.(jpg|jpeg|png)$/i.test(post.file_url || post.large_file_url))
      .map(post => post.file_url || post.large_file_url)
    if (!images.length) return null
    return images[Math.floor(Math.random() * images.length)]
  } catch {
    return null
  }
}

export default {
  command: ['rw'],
  execute: async ({ sock, m }) => {
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    global.db.data.claims ??= {}
    global.db.data.harem ??= {}
    global.db.data.claims[chatId] ??= {}

    const list = Object.values(characters)
    if (!list.length) {
      return sock.sendMessage(chatId, { text: '❌ No hay personajes disponibles' }, { quoted: m })
    }

    const char = list[Math.floor(Math.random() * list.length)]
    const claimedBy = global.db.data.claims[chatId][char.name]
    const status = claimedBy ? 'Reclamada' : 'Libre'

    const imageUrl = await getDanbooruImage(char.tags)

    const caption = `❀ Nombre » *${char.name}*
⚥ Género » *${char.gender}*
❖ Serie » *${char.series || 'Desconocido'}*
✰ Valor » *${char.value || 100}*
♡ Estado » *${status}*`

    if (imageUrl) {
      await sock.sendMessage(chatId, {
        image: { url: imageUrl },
        caption
      }, { quoted: m })
    } else {
      await sock.sendMessage(chatId, { text: caption }, { quoted: m })
    }
  }
}
