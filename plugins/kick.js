export default {
  command: ['kick', 'expulsar', 'behead'],
  description: 'Expulsar a miembros del grupo',
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

    const context = m.message?.extendedTextMessage?.contextInfo
    const mentioned = context?.mentionedJid?.[0]
    const quoted = context?.participant
    const user = mentioned || quoted

    if (!user) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Etiqueta o responde al mensaje de la persona que quieres expulsar.' },
        { quoted: m }
      )
    }

    const meta = await sock.groupMetadata(m.key.remoteJid)
    const target = meta.participants.find(p => p.id === user)

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
        { text: '❌ No puedo expulsarme a mí misma.' },
        { quoted: m }
      )
    }

    if (target.admin === 'superadmin') {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ No puedo expulsar al propietario del grupo.' },
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
          text: `✅ @${user.split('@')[0]} expulsado correctamente.`,
          mentions: [user]
        },
        { quoted: m }
      )
    } catch {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ No pude expulsar al usuario.' },
        { quoted: m }
      )
    }
  }
}
