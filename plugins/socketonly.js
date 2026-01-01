export default {
  command: ['socketonly'],
  description: 'Activa/desactiva modo solo socket en el grupo',
  execute: async ({ sock, m, args, isOwner, isGroup }) => {
    const groupJid = m.key.remoteJid
    
    if (!isGroup) return

    if (!isOwner) {
      return sock.sendMessage(
        groupJid,
        { text: '⛔ Solo el dueño del bot puede usar este comando' },
        { quoted: m }
      )
    }

    const option = args[0]?.toLowerCase()
    if (!['on', 'off'].includes(option)) {
      return sock.sendMessage(
        groupJid,
        { text: 'Uso: /socketonly on | off' },
        { quoted: m }
      )
    }

    const chat = global.db.getChat(groupJid)

    if (option === 'on') {
      chat.socketOnly = true
      await sock.sendMessage(
        groupJid,
        { text: '🔒 *Modo SOCKET ONLY activado*' },
        { quoted: m }
      )
    } else {
      chat.socketOnly = false
      await sock.sendMessage(
        groupJid,
        { text: '🔓 *Modo SOCKET ONLY desactivado*' },
        { quoted: m }
      )
    }
  }
}
