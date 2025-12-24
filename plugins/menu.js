export default {
  command: ['menu', 'help'],
  hidden: true,
  execute: async ({ sock, m }) => {
    const { bot } = global.settings
    const { name, prefix, image, newsletter } = bot

    const senderName =
      m.pushName ||
      m.key.participant?.split('@')[0] ||
      m.key.remoteJid.split('@')[0]

    const saludo =
      `> *¡ʜᴏʟᴀ!* ${senderName}, ¿cómo está tu día?, ` +
      `mucho gusto mi nombre es *${name}*\n\n`

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
`${saludo}` +
`┏━ ━⊜
┃⋄ Tipo :: WhatsApp Bot
┃⋄ Comandos :: ${seen.size}
┗━━◘

${list}`

    await sock.sendMessage(
      m.key.remoteJid,
      {
        image: image ? { url: image } : undefined,
        caption: text,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletter.jid,
            serverMessageId: '0',
            newsletterName: newsletter.name
          }
        }
      },
      { quoted: m }
    )
  }
}
