export default {
  command: ['claim'],
  category: 'gacha',
  execute: async ({ sock, m }) => {
    const userId = m.sender
    const chatId = m.chat

    const replyId = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
                   ? m.message.extendedTextMessage.contextInfo.stanzaId
                   : m.message?.contextInfo?.quotedMessage?.key?.id

    if (!replyId) {
      return sock.sendMessage(chatId, { text: '❌ Debes responder al mensaje del /rw que quieres reclamar.' }, { quoted: m })
    }

    const charKey = global.db.data.tempClaims?.[replyId]
    if (!charKey) {
      return sock.sendMessage(chatId, { text: '❌ Este mensaje no corresponde a ningún roll válido.' }, { quoted: m })
    }

    const char = global.db.data.characters?.[charKey] || require('../lib/characters.js')[charKey]
    if (!char) {
      return sock.sendMessage(chatId, { text: '❌ Error: personaje no encontrado.' }, { quoted: m })
    }

    const user = global.db.getUser(userId)
    user.harem ||= {}
    if (user.harem[charKey]) {
      return sock.sendMessage(chatId, { text: `❌ Ya tienes a ${char.name} en tu colección.` }, { quoted: m })
    }

    user.harem[charKey] = char
    delete global.db.data.tempClaims[replyId]

    await sock.sendMessage(chatId, { text: `✅ ¡Has reclamado a ${char.name}!` }, { quoted: m })
  }
}
