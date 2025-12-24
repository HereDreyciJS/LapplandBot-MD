export default {
  command: ['debugjid'],
  execute: async ({ sock, m }) => {
    const msg = m
    const isGroup = msg.key.remoteJid.endsWith('@g.us')

    const rawSender = isGroup
      ? msg.key.participant
      : msg.key.remoteJid

    const normalized = rawSender.replace(/\D/g, '')

    await sock.sendMessage(
      msg.key.remoteJid,
      {
        text:
          `RAW JID:\n${rawSender}\n\n` +
          `NORMALIZED:\n${normalized}\n\n` +
          `OWNERS:\n${global.settings.bot.owners.join(', ')}`
      },
      { quoted: msg }
    )
  }
}
