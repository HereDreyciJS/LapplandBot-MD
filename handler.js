import print from './lib/print.js'

export const handler = async (sock, m) => {
  try {
    const msg = m.messages?.[0]
    if (!msg || !msg.message) return
    if (msg.key.remoteJid === 'status@broadcast') return

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ''

    if (!body) return

    const prefix = global.settings.bot.prefix
    const isGroup = msg.key.remoteJid.endsWith('@g.us')
    const isCommand = body.startsWith(prefix)

    const rawSender = isGroup
      ? msg.key.participant
      : msg.key.remoteJid

    const senderNumber = rawSender.replace(/\D/g, '')
    const isOwner = global.settings.bot.owners.includes(senderNumber)

    let isAdmin = false

    if (isGroup) {
      try {
        const meta = await sock.groupMetadata(msg.key.remoteJid)
        const participant = meta.participants.find(
          p => p.id.replace(/\D/g, '') === senderNumber
        )
        isAdmin = !!participant?.admin
      } catch {
        isAdmin = false
      }
    }

    await print(sock, msg, body, isCommand, isGroup)

    if (!isCommand) return

    const args = body.slice(prefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()
    const text = args.join(' ')

    const plugin = global.plugins.get(command)
    if (!plugin || typeof plugin.execute !== 'function') return

    await plugin.execute({
      sock,
      m: msg,
      args,
      text,
      prefix,
      command,
      isGroup,
      isOwner,
      isAdmin
    })
  } catch (e) {
    console.error(e)
  }
}
