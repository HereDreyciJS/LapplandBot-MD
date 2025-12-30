export default {
  command: ['socketonly'],
  description: 'Activa/desactiva modo solo socket en el grupo',

  execute: async ({ sock, m, args }) => {
    const groupJid = m.key.remoteJid
    if (!groupJid.endsWith('@g.us')) return

    global.socketOnlyGroups ||= new Map()

    const sender = (m.key.participant || m.sender).split(':')[0]
    const isBot = m.key.fromMe === true
    const owners = global.settings?.bot?.owners || []
    const isOwner = owners.includes(sender)

    if (!isBot && !isOwner) {
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
        { text: 'Uso: socketonly on | off' },
        { quoted: m }
      )
    }

    if (option === 'on') {
      global.socketOnlyGroups.set(groupJid, true)
      await sock.sendMessage(
        groupJid,
        { text: '🔒 Modo SOCKET ONLY activado en este grupo' },
        { quoted: m }
      )
    } else {
      global.socketOnlyGroups.set(groupJid, false)
      await sock.sendMessage(
        groupJid,
        { text: '🔓 Modo SOCKET ONLY desactivado en este grupo' },
        { quoted: m }
      )
    }
  }
}
