import characters from '../lib/gacha/characters.js'

export default {
  command: ['c','claim'],
  execute: async ({ sock, m }) => {
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    global.db.data.claims ??= {}
    global.db.data.harem ??= {}

    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const text =
      quoted?.imageMessage?.caption ??
      quoted?.conversation ??
      ''

    if (!text) {
      return sock.sendMessage(chatId, { text: '❌ Responde a un /rw para reclamar' }, { quoted: m })
    }

    const match = text.match(/Nombre » \*(.+?)\*/)
    if (!match) {
      return sock.sendMessage(chatId, { text: '❌ No se pudo identificar el personaje' }, { quoted: m })
    }

    const char = Object.values(characters).find(c => c.name === match[1])
    if (!char) {
      return sock.sendMessage(chatId, { text: '❌ Personaje no encontrado' }, { quoted: m })
    }

    if (!char.key) char.key = char.name.toLowerCase().replace(/\s+/g, '_')

    if (global.db.data.claims[char.key]) {
      return sock.sendMessage(chatId, { text: '❌ Este personaje ya fue reclamado' }, { quoted: m })
    }

    global.db.data.claims[char.key] = sender
    global.db.data.harem[sender] ??= []
    if (!global.db.data.harem[sender].some(c => c.key === char.key)) {
      global.db.data.harem[sender].push(char)
    }

    await sock.sendMessage(
      chatId,
      { text: `💖 *${char.name}* ahora es tuya` },
      { quoted: m }
    )
  }
}
