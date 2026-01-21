import print from './lib/utils/print.js'

const adminCache = new Map()
const senderCache = new Map()

export const handler = async (sock, msg) => {
  try {
    if (!msg?.message) return
    if (msg.key.remoteJid === 'status@broadcast') return

    const jid = msg.key.remoteJid
    const isGroup = jid.endsWith('@g.us')

    const message = msg.message
    const body =
      message.conversation ??
      message.extendedTextMessage?.text ??
      message.imageMessage?.caption ??
      message.videoMessage?.caption

    if (!body) return

    const prefix = global.settings.bot.prefix
    if (body[0] !== prefix) return

    await print(sock, msg, body, true, isGroup)

    const text = body.slice(prefix.length).trim()
    if (!text) return

    const args = text.split(/\s+/)
    const command = args.shift().toLowerCase()

    const plugin = global.plugins.get(command)
    if (!plugin?.execute) return

    const rawSender = isGroup ? msg.key.participant : jid
    if (!rawSender) return
if (isGroup) {
  const chat = global.db.getChat(msg.key.remoteJid)
  if (chat.socketOnly && !isOwner && !isBot) {
    return
  }
}
    let senderNumber = senderCache.get(rawSender)
    if (!senderNumber) {
      senderNumber = rawSender.replace(/\D/g, '')
      senderCache.set(rawSender, senderNumber)
    }

    const isOwner = global.settings.bot.owners.includes(senderNumber)
    const isBot = msg.key.fromMe === true

    if (plugin.owner && !isOwner && !isBot) return
    if (plugin.group && !isGroup) return

    let isAdmin = false
    if (isGroup && plugin.admin) {
      const now = Date.now()
      let cached = adminCache.get(jid)

      if (!cached || now - cached.time > 60_000) {
        try {
          const meta = await sock.groupMetadata(jid)
          cached = {
            admins: meta.participants
              .filter(p => p.admin)
              .map(p => p.id),
            time: now
          }
          adminCache.set(jid, cached)
        } catch {
          cached = { admins: [], time: now }
        }
      }
      isAdmin = cached.admins.includes(rawSender)
      if (!isAdmin) return
    }

    const user = global.db.getUser(rawSender)
    if (msg.pushName && msg.pushName !== user.name) {
      user.name = msg.pushName
    }

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
