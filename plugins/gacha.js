import fs from 'fs/promises'

const FILE = './lib/characters.json'
const locks = new Map()

async function loadCharacters() {
  try {
    const raw = await fs.readFile(FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function getAllCharacters(db) {
  return Object.values(db).flatMap(s =>
    Array.isArray(s.characters) ? s.characters : []
  )
}

export default {
  command: ['rw', 'roll', 'rollwaifu'],
  execute: async ({ sock, m, command, prefix }) => {
    if (!m?.key?.remoteJid) return

    const chatId = m.key.remoteJid
    const sender = m.key.participant || chatId
    const now = Date.now()

    if (locks.has(sender)) {
      if (now - locks.get(sender) < 15000) return
      locks.delete(sender)
    }

    locks.set(sender, now)

    try {
      const db = await loadCharacters()
      const all = getAllCharacters(db)
      if (!all.length) {
        await sock.sendMessage(chatId, { text: '❌ No hay personajes disponibles.' })
        return
      }

      const pick = all[Math.floor(Math.random() * all.length)]

      const text =
        `🎲 *GACHA*\n\n` +
        `👤 *Nombre:* ${pick.name || 'Desconocido'}\n` +
        `📺 *Fuente:* ${pick.source || 'Desconocido'}\n` +
        `💎 *Valor:* ${pick.value || 100}`

      if (pick.image) {
        await sock.sendMessage(chatId, {
          image: { url: pick.image },
          caption: text
        })
      } else {
        await sock.sendMessage(chatId, { text })
      }

    } catch (e) {
      await sock.sendMessage(chatId, {
        text: `❌ Error ejecutando ${prefix + command}`
      })
    } finally {
      locks.delete(sender)
    }
  }
}
