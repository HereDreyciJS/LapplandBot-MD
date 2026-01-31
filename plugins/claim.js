import characters from '../lib/gacha/characters.js'

export default {
  command: ['claim'],
  execute: async ({ sock, m }) => {
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    global.db.data.chats ??= {}
    const chatDb = global.db.data.chats[chatId]
    chatDb.claims ??= {}
    chatDb.harem ??= {}
    chatDb.harem[sender] ??= []

    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const text = quoted?.imageMessage?.caption || quoted?.conversation
    if (!text) return sock.sendMessage(chatId, { text: '❌ Responde a un /rw para reclamar' }, { quoted: m })

    const match = text.match(/Nombre » \*(.+?)\*/)
    if (!match) return sock.sendMessage(chatId, { text: '❌ No se pudo identificar el personaje' }, { quoted: m })

    const char = Object.values(characters).find(c => c.name === match[1])
    if (!char) return sock.sendMessage(chatId, { text: '❌ Personaje no encontrado' }, { quoted: m })

    if (chatDb.claims[char.name]) return sock.sendMessage(chatId, { text: '❌ Ya fue reclamada en este grupo' }, { quoted: m })

    chatDb.claims[char.name] = sender
    chatDb.harem[sender].push(char)

    await sock.sendMessage(chatId, { text: `💖 *${char.name}* ahora es tuya en este grupo` }, { quoted: m })
  }
}
