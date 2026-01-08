import { getUptime } from '../lib/utils/uptime.js'
import { getBotType } from '../lib/utils/botType.js'

export default {
  command: ['menu', 'help'],
  hidden: true,

  execute: async ({ sock, m, user }) => {
    const { bot } = global.settings
    const { name, prefix, image, newsletter } = bot

    const jid = m.key.participant || m.key.remoteJid
    const mention = `@${jid.split('@')[0]}`
    const displayName = user?.name || mention

    const { type } = getBotType(sock)

    const botTypeLabel =
      type === 'main'
        ? 'Principal ⟡'
        : type === 'sub'
        ? 'Sub-Bot ⟢'
        : 'Desconocido ◇'

    const saludo =
      `*¡ʜᴏʟᴀ!* ${mention}\n` +
      `mucho gusto, mi nombre es *${name}*\n\n`

    const seen = new Set()

    const list = [...global.plugins.values()]
      .filter(p => !p.hidden)
      .map(p => {
        const cmd = Array.isArray(p.command) ? p.command[0] : p.command
        if (seen.has(cmd)) return null
        seen.add(cmd)
        const title = `┊ ${prefix}${cmd}`
        const desc = p.description ? `\n  └ ${p.description}` : ''
        return `${title}${desc}`
      })
      .filter(Boolean)
      .join('\n\n')

    const uptime = getUptime()

    const text =
`${saludo}` +
`┏━ Info ━┓
┃ Uptime :: ${uptime}
┃ Tipo   :: ${botTypeLabel}
┗━━━━━━━┛

${list}`

    await sock.sendMessage(
      m.key.remoteJid,
      {
        image: image ? { url: image } : undefined,
        caption: text,
        mentions: [jid],
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
