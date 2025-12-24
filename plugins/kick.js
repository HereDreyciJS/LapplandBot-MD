export default {
  command: ['kick'],
  execute: async ({ sock, m, isGroup, isAdmin, isOwner }) => {
    if (!isGroup) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Este comando solo funciona en grupos.' },
        { quoted: m }
      )
    }

    if (!isAdmin && !isOwner) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Solo administradores pueden usar este comando.' },
        { quoted: m }
      )
    }

    const mentioned =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    const quoted =
      m.message?.extendedTextMessage?.contextInfo?.participant

    const user = mentioned || quoted

    if (!user) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Etiqueta o responde al mensaje de la persona que quieres eliminar.' },
        { quoted: m }
      )
    }

    const groupMetadata = await sock.groupMetadata(m.key.remoteJid)
    const participants = groupMetadata.participants

    const target = participants.find(p => p.id === user)

    if (!target) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '⚠️ El usuario ya no está en el grupo.' },
        { quoted: m }
      )
    }

    if (user === sock.user.id) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ No puedo eliminar al bot.' },
        { quoted: m }
      )
    }

    if (target.admin === 'superadmin') {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ No puedo eliminar al propietario del grupo.' },
        { quoted: m }
      )
    }

    try {
      await sock.groupParticipantsUpdate(
        m.key.remoteJid,
        [user],
        'remove'
      )

      await sock.sendMessage(
        m.key.remoteJid,
        {
          text: `✅ @${user.split('@')[0]} eliminado correctamente.`,
          mentions: [user]
        },
        { quoted: m }
      )
    } catch {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ No pude eliminar al usuario.' },
        { quoted: m }
      )
    }
  }
}
