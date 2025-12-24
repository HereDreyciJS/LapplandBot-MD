export default {
  command: ['menu', 'help'],
  execute: async ({ sock, m }) => {
    const { name, prefix, image } = global.settings.bot

    const seen = new Set()

    const list = [...global.plugins.values()]
      .map(p => {
        const cmd = Array.isArray(p.command) ? p.command[0] : p.command
        if (seen.has(cmd)) return null
        seen.add(cmd)

        const desc = p.description ? `\n  ↳ ${p.description}` : ''
        return `${prefix}${cmd}${desc}`
      })
      .filter(Boolean)
      .join('\n')

    const text =
      `╭─〔 ${name} 〕─╮\n` +
      `${list}\n` +
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
