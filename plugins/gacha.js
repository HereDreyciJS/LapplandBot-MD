import characters from '../lib/gacha/characters.js'
import fetch from 'node-fetch'

function formatTag(tag) {
  return String(tag).trim().toLowerCase().replace(/\s+/g, '_')
}

async function buscarImagenDanbooru(tag) {
  const query = encodeURIComponent(tag)
  const url = `https://danbooru.donmai.us/posts.json?tags=${query}&limit=10`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LapplandBot', 'Accept': 'application/json' }
    })
    if (!res.ok) return []
    const data = await res.json()
    const images = data
      .filter(p => (p.file_url || p.large_file_url) && /\.(jpg|jpeg|png)$/i.test(p.file_url || p.large_file_url))
      .map(p => p.file_url || p.large_file_url)
    return images
  } catch {
    return []
  }
}

export default {
  command: ['rollwaifu', 'rw', 'roll'],
  category: 'gacha',
  run: async (client, m, args, usedPrefix, command) => {
    const userId = m.sender
    const chatId = m.chat

    const allCharacters = Object.values(characters)
    if (!allCharacters.length) return client.sendMessage(chatId, { text: '❌ No hay personajes disponibles.' }, { quoted: m })

    const selected = allCharacters[Math.floor(Math.random() * allCharacters.length)]
    const baseTag = formatTag(selected.tags[0] || '')
    const mediaList = await buscarImagenDanbooru(baseTag)
    const media = mediaList[Math.floor(Math.random() * mediaList.length)]

    if (!media) return client.sendMessage(chatId, { text: `❌ No se encontraron imágenes para ${selected.name}` }, { quoted: m })

    const msgText = `❀ Nombre » *${selected.name}*\n⚥ Género » *${selected.gender || 'Desconocido'}*\n✰ Valor » *${selected.value}*`
    await client.sendMessage(chatId, { image: { url: media }, caption: msgText }, { quoted: m })
  }
}
