export default {
  command: ['welcome'],
  admin: true,

  execute: async ({ sock, m, args, isGroup }) => {
    if (!isGroup) return

    const chat = global.db.getChat(m.key.remoteJid)

    if (!args[0]) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: 'Uso: /welcome on | off' },
        { quoted: m }
      )
    }

    if (args[0] === 'on') {
      chat.welcome = true
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '✅ Bienvenida activada.' },
        { quoted: m }
      )
    }

    if (args[0] === 'off') {
      chat.welcome = false
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Bienvenida desactivada.' },
        { quoted: m }
      )
    }
  }
}
