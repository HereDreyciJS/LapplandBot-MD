export default {
  command: ['menu', 'help'],
  execute: async ({ sock, m }) => {
    const name = global.settings.bot.name
    const prefix = global.settings.bot.prefix
    const image = global.settings.bot.image

    const commands = [...new Set(global.plugins.values())]
      .map(p => {
        const cmd = Array.isArray(p.command) ? p.command[0] : p.command
        return `${prefix}${cmd}`
      })
      .join('\n')

    const text =
      `╭─〔 ${name} 〕─╮\n` +
      `${commands}\n` +
      `╰──────────────╯`

    await sock.sendMessage(
      m.key.remoteJid,
      {
        image: { url: image },
        caption: text
      },
      { quoted: m }
    )
  }
}
