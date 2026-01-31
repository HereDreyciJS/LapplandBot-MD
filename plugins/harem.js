export default {
  command: ['harem'],
  execute: async ({ sock, m }) => {
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    global.db.data.chats ??= {}
    const chatDb = global.db.data.chats[chatId]
    chatDb.harem ??= {}
    const list = chatDb.harem[sender]
    
    if (!list || !list.length) return sock.sendMessage(chatId, { text: '❌ No tienes waifus aún en este grupo' }, { quoted: m })

    const text = list.map((c, i) => `${i + 1}. ${c.name} (${c.series || 'Desconocido'})`).join('\n')
    await sock.sendMessage(chatId, { text: `💘 *Tu Harem en este grupo*\n\n${text}` }, { quoted: m })
  }
}
