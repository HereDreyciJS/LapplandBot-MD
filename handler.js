export const handler = async (sock, m) => {
  try {
    const msg = m.messages?.[0]
    if (!msg || !msg.message) return
    if (msg.key?.fromMe) return
    if (msg.key?.remoteJid === 'status@broadcast') return

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ''

    if (!body) return

    const prefix = global.settings.bot.prefix
    if (!body.startsWith(prefix)) return

    const args = body.slice(prefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()
    const text = args.join(' ')

    if (!command) return

    const plugin = global.plugins.get(command)
    if (!plugin) return

    await plugin.execute({
      sock,
      m: msg,
      args,
      text,
      prefix,
      command
    })
  } catch (e) {
    console.error('Error in handler:', e)
  }
}
