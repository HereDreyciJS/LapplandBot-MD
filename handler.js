import { plugins } from './lib/plugins.js'

export const handler = async (sock, m) => {
  try {
    const msg = m.messages?.[0]
    if (!msg || !msg.message || msg.key?.fromMe) return

    const type = Object.keys(msg.message)[0]

    const body =
      type === 'conversation'
        ? msg.message.conversation
        : type === 'imageMessage'
        ? msg.message.imageMessage?.caption || ''
        : type === 'videoMessage'
        ? msg.message.videoMessage?.caption || ''
        : type === 'extendedTextMessage'
        ? msg.message.extendedTextMessage?.text || ''
        : ''

    if (!body) return

    const prefix = '/'
    if (!body.startsWith(prefix)) return

    const args = body.slice(prefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()
    const text = args.join(' ')

    if (!command) return

    const plugin = plugins.get(command)

    if (!plugin) {
      console.log(`Command not found: ${command}`)
      return
    }

    await plugin.execute({
      sock,
      m: msg,
      args,
      text,
      width: prefix + command
    })
  } catch (e) {
    console.error('Error in handler:', e)
  }
}
