export default {
  command: ['menu', 'help'],
  execute: async ({ sock, m }) => {
    const prefix = global.settings.bot.prefix
    const name = global.settings.bot.name

    const list = [...global.plugins.values()]
      .map(p => {
        const cmd = Array.isArray(p.command) ? p.command[0] : p.command
        const desc = p.description ? `\n  ↳ ${p.description}` : ''
        return `${prefix}${cmd}${desc}`
      })
      .join('\n')

    const text =
      `╭─〔 ${name} 〕─╮\n` +
      `${list}\n` +
      `╰──────────────╯`

    await sock.sendMessage(
      m.key.remoteJid,
      { text },
      { quoted: m }
    )
  }
}
