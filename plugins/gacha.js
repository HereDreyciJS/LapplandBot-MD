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
  return Object.values(db).flatMap(s =>
    Array.isArray(s.characters) ? s.characters : []
  )
}

function getSeriesNameByCharacter(db, id) {
  return (
    Object.entries(db).find(([, serie]) =>
      serie.characters?.some(c => String(c.id) === String(id))
    )?.[1]?.name || 'Desconocido'
  )
}

function formatTag(tag) {
  return String(tag).trim().toLowerCase().replace(/\s+/g, '_')
}

async function buscarImagen(tag) {
  const query = encodeURIComponent(formatTag(tag))
  const url = `https://danbooru.donmai.us/posts.json?tags=${query}&limit=10`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    if (!res.ok) return []
    const json = await res.json()
    return json
      .map(p => p.file_url || p.large_file_url)
      .filter(Boolean)
  } catch {
    return []
  }
}

export default {
  command: ['rw', 'roll', 'rollwaifu'],
  description: 'Gacha de personajes',

  execute: async ({ sock, m }) => {
    const userId = m.sender
    const chatId = m.chat
    const now = Date.now()

    cleanOldLocks()

    if (rollLocks.has(userId)) return
    rollLocks.set(userId, now)

    try {
      const db = await loadCharacters()
      const all = flattenCharacters(db)
      if (!all.length) return m.reply('❌ No hay personajes.')

      const selected = all[Math.floor(Math.random() * all.length)]
      const source = getSeriesNameByCharacter(db, selected.id)

      const images = await buscarImagen(selected.tags?.[0] || selected.name)
      if (!images.length) return m.reply('❌ No se encontró imagen.')

      const img = images[Math.floor(Math.random() * images.length)]

      const text = `❀ *${selected.name}*
✦ Fuente: *${source}*
✦ Valor: *${selected.value || 100}*`

      await sock.sendMessage(
        chatId,
        { image: { url: img }, caption: text },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
      m.reply('❌ Error ejecutando gacha.')
    } finally {
      rollLocks.delete(userId)
    }
  }
}
