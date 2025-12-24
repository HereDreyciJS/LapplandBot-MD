import print from './lib/print.js'

export const handler = async (sock, m) => {
  try {
    const msg = m.messages?.[0]
    if (!msg || !msg.message) return
    if (msg.key?.remoteJid === 'status@broadcast') return

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

    const botNumber = sock.user.id.replace(/\D/g, '')
    let senderNumber

    if (msg.key.fromMe) {
      senderNumber = botNumber
    } else {
      const rawSender = msg.key.participant || msg.key.remoteJid
      senderNumber = rawSender.replace(/\D/g, '')
    }

    const isOwner = global.settings.bot.owners.includes(senderNumber)

    await print(sock, msg, body, isCommand, isGroup)

    if (!isCommand) return

    const args = body.slice(prefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()
    const text = args.join(' ')

    if (!command) return

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
      isOwner
    })
  } catch (e) {
    console.error('❌ Error en handler:', e)
  }
}
