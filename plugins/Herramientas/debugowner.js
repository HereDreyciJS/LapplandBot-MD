export default {
  command: ['debugowner'],
  execute: async ({ sock, m }) => {
    await sock.sendMessage(
      m.key.remoteJid,
      {
        text:
          'OWNERS CONFIG:\n' +
          JSON.stringify(global.settings.bot.owners, null, 2)
      },
      { quoted: m }
    )
  }
}
