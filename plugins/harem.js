export default {
  command: ['harem'],
  execute: async ({ sock, m }) => {
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    global.db.data.harem ??= {}
    global.db.data.harem[chatId] ??= {}
    global.db.data.harem[chatId][sender] ??= []

    const list = global.db.data.harem[chatId][sender]
    if (!list.length) {
      return sock.sendMessage(chatId, { text: '❌ No tienes waifus aún' }, { quoted: m })
    }

    const text = list.map((c, i) =>
      `${i + 1}. ${c.name} (${c.series || 'Desconocido'})`
    ).join('\n')

    await sock.sendMessage(chatId, {
      text: `💘 *Tu Harem*\n\n${text}`
    }, { quoted: m })
  }
}
