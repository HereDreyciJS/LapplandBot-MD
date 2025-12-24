export default {
  command: ['menu', 'help'],
  hidden: true,
  execute: async ({ sock, m }) => {
    const { name, prefix, image } = global.settings.bot

    const seen = new Set()

    const list = [...global.plugins.values()]
      .filter(p => !p.hidden)
      .map(p => {
        const cmd = Array.isArray(p.command) ? p.command[0] : p.command
        if (seen.has(cmd)) return null
        seen.add(cmd)

        const title = `✿ *${prefix}${cmd}*`
        const desc = p.description ? `\n> ${p.description}` : ''
        return `${title}${desc}`
      })
      .filter(Boolean)
      .join('\n\n')

    const text =
      `╭─〔 ${name} 〕─╮\n\n` +
      `${list}\n\n` +
      `╰──────────────╯`

    await sock.sendMessage(
      m.key.remoteJid,
      {
        image: image ? { url: image } : undefined,
        caption: text
      },
      { quoted: m }
    )
  }
}
