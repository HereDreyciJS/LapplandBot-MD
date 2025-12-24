export default {
  command: ['owners', 'ownerlist'],
  execute: async ({ sock, m }) => {
    const owners = global.settings.bot.owners || []

    if (!owners.length) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '⚠️ No hay owners configurados.' },
        { quoted: m }
      )
    }

    const list = owners
      .map((num, i) => `${i + 1}. +${num}`)
      .join('\n')

    await sock.sendMessage(
      m.key.remoteJid,
      { text: `👑 *Owners del bot*\n\n${list}` },
      { quoted: m }
    )
  }
}
