import print from './lib/print.js'

export const handler = async (sock, msg) => {
  try {
    if (!msg || !msg.message) return
    if (msg.key.remoteJid === 'status@broadcast') return

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ''

    const prefix = global.settings.bot.prefix
    const isCommand = body.startsWith(prefix)
    if (!body && !isCommand) return

    const isGroup = msg.key.remoteJid.endsWith('@g.us')
    const rawSender = isGroup ? msg.key.participant : msg.key.remoteJid
    if (!rawSender) return

    const senderNumber = rawSender.replace(/\D/g, '')
    const isOwner = global.settings.bot.owners.includes(senderNumber)
    const isBot = msg.key.fromMe === true

    let isAdmin = false
    if (isGroup) {
      try {
        const meta = await sock.groupMetadata(msg.key.remoteJid)
        const participant = meta.participants.find(p => p.id === rawSender)
        isAdmin = !!(participant?.admin || participant?.isSuperAdmin)
      } catch {
        isAdmin = false
      }
    }

    await print(sock, msg, body, isCommand, isGroup)

    if (!isCommand) return

    const args = body.slice(prefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()
    const text = args.join(' ')

    if (isGroup) {
      const chat = global.db.getChat(msg.key.remoteJid)
      if (chat?.socketOnly && !isBot && !isOwner) return
    }

    const plugin = global.plugins.get(command)
    if (!plugin || typeof plugin.execute !== 'function') return

    if (plugin.owner && !isOwner) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: '❌ Este comando es solo para el owner.' },
        { quoted: msg }
      )
    }

    if (plugin.admin && !isAdmin) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: '❌ Este comando es solo para administradores.' },
        { quoted: msg }
      )
    }

    await plugin.execute({
      sock,
      m: msg,
      args,
      text,
      prefix,
      command,
      isGroup,
      isOwner,
      isAdmin,
      pushName: msg.pushName
    })
  } catch (e) {
    console.error('❌ Error en handler:', e)
  }
}
