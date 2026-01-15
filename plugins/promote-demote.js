export default {
  command: ['promote', 'demote'],
  description: 'Da o quita administrador a un usuario',
  execute: async ({ sock, m, isAdmin, isGroup, command }) => {
    if (!isGroup) return

    if (!isAdmin) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Solo los administradores pueden usar este comando.' },
        { quoted: m }
      )
    }

    let text = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ? m.message.extendedTextMessage.contextInfo.participant
      : m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!text) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: 'Etiqueta o responde al mensaje de alguien para usar este comando.' },
        { quoted: m }
      )
    }

    const isPromote = ['promote', 'daradmin'].includes(command)
    const action = isPromote ? 'promote' : 'demote'

    try {
      await sock.groupParticipantsUpdate(m.key.remoteJid, [text], action)
    } catch (e) {
      console.error('Error en Promote/Demote:', e)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Error: Asegúrate de que el bot sea administrador.' },
        { quoted: m }
      )
    }
  }
}
