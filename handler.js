import print from './lib/utils/print.js'

const adminCache = new Map()

export const handler = async (sock, msg) => {
  try {
    if (!msg?.message) return
    if (msg.key.remoteJid === 'status@broadcast') return

    const message = msg.message
    const body =
      message.conversation ??
      message.extendedTextMessage?.text ??
      message.imageMessage?.caption ??
      message.videoMessage?.caption ??
      ''

    if (!body) return

    const prefix = global.settings.bot.prefix
    const isCommand = body.startsWith(prefix)

    if (isCommand) await print(sock, msg, body, isCommand, msg.key.remoteJid.endsWith('@g.us'))

    if (!isCommand) return

    const args = body.slice(prefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()
    if (!command) return

    const isGroup = msg.key.remoteJid.endsWith('@g.us')
    const rawSender = isGroup ? msg.key.participant : msg.key.remoteJid
    if (!rawSender) return

    const senderNumber = rawSender.replace(/\D/g, '')
    const isOwner = global.settings.bot.owners.includes(senderNumber)
    const isBot = msg.key.fromMe === true
const chat = global.db.getChat(msg.key.remoteJid)

if (chat?.socketOnly) {
  if (!isBot && !isOwner) return
}
    const user = global.db.getUser(rawSender)
    if (msg.pushName && msg.pushName !== user.name) user.name = msg.pushName

    let isAdmin = false
    if (isGroup) {
      const chatId = msg.key.remoteJid
      const now = Date.now()
      let cached = adminCache.get(chatId)

      if (!cached || now - cached.time > 60_000) {
        try {
          const meta = await sock.groupMetadata(chatId)
          const admins = meta.participants
            .filter(p => p.admin)
            .map(p => p.id || p.lid)
          cached = { admins, time: now }
          adminCache.set(chatId, cached)
        } catch {
          cached = { admins: [], time: now }
        }
      }
      isAdmin = cached.admins.includes(rawSender)
    }

    const plugin = global.plugins.get(command)
    if (!plugin?.execute) return

    if (plugin.owner && !isOwner) return
    if (plugin.admin && !isAdmin) return

    await plugin.execute({
      sock,
      m: msg,
      args,
      text: args.join(' '),
      prefix,
      command,
      isGroup,
      isOwner,
      isAdmin,
      user
    })

  } catch (e) {
    console.error('❌ Error en handler:', e)
  }
}
