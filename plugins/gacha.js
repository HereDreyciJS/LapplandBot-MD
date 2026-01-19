import fetch from 'node-fetch'
import { promises as fs } from 'fs'

const FILE_PATH = './lib/characters.json'
const rollLocks = new Map()

function cleanOldLocks() {
  const now = Date.now()
  for (const [k, v] of rollLocks) {
    if (now - v > 30000) rollLocks.delete(k)
  }
}

async function loadCharacters() {
  try {
    await fs.access(FILE_PATH)
  } catch {
    await fs.writeFile(FILE_PATH, '{}')
  }
  return JSON.parse(await fs.readFile(FILE_PATH, 'utf-8'))
}

function flattenCharacters(db) {
  return Object.values(db).flatMap(s => Array.isArray(s.characters) ? s.characters : [])
}

function getSeriesNameByCharacter(db, id) {
  return Object.entries(db).find(([, s]) =>
    Array.isArray(s.characters) && s.characters.some(c => String(c.id) === String(id))
  )?.[1]?.name || 'Desconocido'
}

function formatTag(tag) {
  return String(tag).trim().toLowerCase().replace(/\s+/g, '_')
}

async function buscarImagen(tag) {
  const q = encodeURIComponent(formatTag(tag))
  const urls = [
    `https://danbooru.donmai.us/posts.json?tags=${q}&limit=10`,
    `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${q}&limit=10`
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (!res.ok) continue
      const json = await res.json()
      const imgs = Array.isArray(json)
        ? json.map(p => p.file_url || p.large_file_url).filter(Boolean)
        : []
      if (imgs.length) return imgs
    } catch {}
  }
  return []
}

export default {
  command: ['rollwaifu', 'rw', 'roll'],
  category: 'gacha',
  execute: async ({ sock, m, prefix, command }) => {
    const chatId = m.key.remoteJid
    const userId = m.key.participant || chatId

    cleanOldLocks()

    if (rollLocks.has(userId)) return
    rollLocks.set(userId, Date.now())

    try {
      const chat = global.db.getChat(chatId)
      if (!chat.gacha) {
        return sock.sendMessage(
          chatId,
          { text: `ꕥ El gacha está desactivado.\nUsa ${prefix}gacha on` },
          { quoted: m }
        )
      }

      const db = await loadCharacters()
      const all = flattenCharacters(db)
      if (!all.length) return

      const selected = all[Math.floor(Math.random() * all.length)]
      const source = getSeriesNameByCharacter(db, selected.id)
      const tag = selected.tags?.[0]
      const images = await buscarImagen(tag)
      if (!images.length) return

      const img = images[Math.floor(Math.random() * images.length)]

      const text =
`❀ Nombre » *${selected.name}*
⚥ Género » *${selected.gender || 'Desconocido'}*
✰ Valor » *${selected.value || 100}*
❖ Fuente » *${source}*`

      await sock.sendMessage(
        chatId,
        { image: { url: img }, caption: text },
        { quoted: m }
      )

    } finally {
      rollLocks.delete(userId)
    }
  }
}
