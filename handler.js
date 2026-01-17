import print from './lib/utils/print.js'

const adminCache = new Map()

setInterval(() => {
  const now = Date.now()
  for (const [k, v] of adminCache) {
    if (now - v.time > 5 * 60_000) adminCache.delete(k)
  }
}, 5 * 60_000)

export const handler = async (sock, msg) => {
  try {
    const message = msg?.message
    if (!message) return
    if (msg.key.remoteJid === 'status@broadcast') return

    const body =
      message.conversation ??
      message.extendedTextMessage?.text ??
      message.imageMessage?.caption ??
      message.videoMessage?.caption ??
      ''

    if (!body) return

    const prefix = global.settings.bot.prefix
    const isCommand = body.startsWith(prefix)

    const isGroup = msg.key.remoteJid.endsWith('@g.us')
    const rawSender = isGroup ? msg.key.participant : msg.key.remoteJid
    if (!rawSender) return

    const senderNumber = rawSender.replace(/\D/g, '')
    const isOwner = global.settings.bot.owners.includes(senderNumber)
    const isBot = msg.key.fromMe === true

    if (isCommand) await print(sock, msg, body, isCommand, isGroup)

    const args = body.slice(prefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()
    const text = args.join(' ')

    const cdKey = `${rawSender}:${command}`
    const now = Date.now()
    const last = global.cooldowns?.get(cdKey) || 0
    if (now - last < 2000) return
    global.cooldowns?.set(cdKey, now)

    const plugin = global.plugins.get(command)
    if (!plugin?.execute) return

    let isAdmin = false
    if (isGroup) {
      const chatId = msg.key.remoteJid
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

    const user = isCommand ? global.db.getUser(rawSender) : {}
    if (user && msg.pushName && msg.pushName !== user.name) user.name = msg.pushName

    if (plugin.owner && !isOwner) return
    if (plugin.admin && !isAdmin) return

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
      user
    })
  } catch (e) {
    console.error('❌ Error en handler:', e)
  }
}
