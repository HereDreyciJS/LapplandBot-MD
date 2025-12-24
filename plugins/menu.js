import os from 'os'

export default {
  command: ['menu', 'help'],
  hidden: true,
  execute: async ({ sock, m }) => {
    const { name, prefix, image } = global.settings.bot

    const uptime = process.uptime() * 1000
    const time = new Date().toLocaleString('es-MX')
    const platform = os.platform()
    const node = process.version
    const users = Object.keys(global.db?.data?.users || {}).length
    const owner = global.settings.bot.owners.join(', ')

    const info =
`*┏━ ${name} ━⊜*
┃⋄ Fecha :: ${time}
┃⋄ Developer :: ${owner}
┃⋄ Tipo :: WhatsApp Bot
┃⋄ Usuarios :: ${users}
┃⋄ Sistema :: ${platform} (${node})
┃⋄ Enlace :: wa.me/${sock.user.id.split(':')[0]}
┃⋄ Uptime :: ${formatUptime(uptime)}
┗━━◘`

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
      `${info}\n\n` +
      `${list}`

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

function formatUptime(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${h}h ${m}m ${s}s`
}
