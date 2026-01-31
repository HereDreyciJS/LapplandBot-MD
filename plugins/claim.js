import characters from '../lib/gacha/characters.js'

export default {
  command: ['claim', 'c'],
  execute: async ({ sock, m }) => {
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    global.db.data.claims ??= {}
    global.db.data.claims[chatId] ??= {}
    global.db.data.harem ??= {}
    global.db.data.harem[chatId] ??= {}
    global.db.data.harem[chatId][sender] ??= []

    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const text = quoted?.imageMessage?.caption || quoted?.conversation
    if (!text) {
      return sock.sendMessage(chatId, { text: '❌ Responde a un /rw para reclamar' }, { quoted: m })
    }

    const match = text.match(/Nombre » \*(.+?)\*/)
    if (!match) {
      return sock.sendMessage(chatId, { text: '❌ No se pudo identificar el personaje' }, { quoted: m })
    }

    const charName = match[1]
    const char = Object.values(characters).find(c => c.name === charName)
    if (!char) return

    if (global.db.data.claims[chatId][char.key]) {
      return sock.sendMessage(chatId, { text: '❌ Ya fue reclamada en este grupo' }, { quoted: m })
    }

    global.db.data.claims[chatId][char.key] = sender
    global.db.data.harem[chatId][sender].push(char)

    await sock.sendMessage(chatId, {
      text: `💖 *${char.name}* ahora te pertenece`
    }, { quoted: m })
  }
}
