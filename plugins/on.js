export default {
  command: ['welcome', 'bienvenida'],
  admin: true,

  execute: async ({ sock, m, args, isGroup }) => {
    if (!isGroup) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Este comando solo funciona en grupos.' },
        { quoted: m }
      )
    }

    const chat = global.db.getChat(m.key.remoteJid)
    const option = args[0]?.toLowerCase()

    if (!option) {
      return sock.sendMessage(
        m.key.remoteJid,
        {
          text:
            `✦ *Bienvenida*\n\n` +
            `Estado actual: *${chat.welcome ? 'ACTIVADA ✅' : 'DESACTIVADA ❌'}*\n\n` +
            `Uso:\n` +
            `• /welcome on\n` +
            `• /welcome off`
        },
        { quoted: m }
      )
    }

    if (option === 'on' || option === 'enable' || option === 'activar') {
      chat.welcome = true
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '✅ Bienvenida activada correctamente.' },
        { quoted: m }
      )
    }

    if (option === 'off' || option === 'disable' || option === 'desactivar') {
      chat.welcome = false
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Bienvenida desactivada correctamente.' },
        { quoted: m }
      )
    }

    return sock.sendMessage(
      m.key.remoteJid,
      { text: '⚠️ Opción no válida. Usa: on | off' },
      { quoted: m }
    )
  }
}
