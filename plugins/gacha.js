import fetch from 'node-fetch'
import { promises as fs } from 'fs'

const FILE_PATH = './lib/characters.json'
const rollLocks = new Map()

async function loadCharacters() {
  try {
    await fs.access(FILE_PATH)
  } catch {
    await fs.writeFile(FILE_PATH, '{}')
  }
  return JSON.parse(await fs.readFile(FILE_PATH, 'utf-8'))
}

function flattenCharacters(db) {
  return Object.values(db).flatMap(s =>
    Array.isArray(s.characters) ? s.characters : []
  )
}

async function buscarImagen(tag) {
  const query = encodeURIComponent(tag)
  const url = `https://danbooru.donmai.us/posts.json?tags=${query}&limit=10`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.map(p => p.file_url || p.large_file_url).filter(Boolean)
  } catch {
    return []
  }
}

export default {
  command: ['rw', 'roll', 'rollwaifu'],
  description: 'Gacha simple',

  execute: async ({ sock, m }) => {
    const userId = m.sender
    const chatId = m.chat

    if (rollLocks.has(userId)) return
    rollLocks.set(userId, Date.now())

    try {
      const db = await loadCharacters()
      const all = flattenCharacters(db)

      if (!all.length) {
        return sock.sendMessage(
          chatId,
          { text: '❌ No hay personajes cargados.' },
          { quoted: m }
        )
      }

      const selected = all[Math.floor(Math.random() * all.length)]
      const images = await buscarImagen(selected.name)

      if (!images.length) {
        return sock.sendMessage(
          chatId,
          { text: '❌ No se encontró imagen.' },
          { quoted: m }
        )
      }

      const img = images[Math.floor(Math.random() * images.length)]

      const text = `🎲 *${selected.name}*
⭐ Valor: *${selected.value || 100}*`

      await sock.sendMessage(
        chatId,
        { image: { url: img }, caption: text },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await sock.sendMessage(
        chatId,
        { text: '❌ Error ejecutando el gacha.' },
        { quoted: m }
      )
    } finally {
      rollLocks.delete(userId)
    }
  }
}
