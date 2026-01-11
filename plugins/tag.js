module.exports = {
  command: ['tag', 'tagall', 'todos'],
  description: 'Menciona a todos de forma invisible (Solo Admins) y responde a un mensaje',
  execute: async ({ sock, m, args }) => {
    try {
      if (!m.key.remoteJid.endsWith('@g.us')) return

      const groupMetadata = await sock.groupMetadata(m.key.remoteJid)
      const participants = groupMetadata.participants
      const admins = participants.filter(p => p.admin !== null).map(p => p.id)
      const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net')
      const isUserAdmin = admins.includes(m.key.participant || m.key.remoteJid)

      if (!isUserAdmin) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ Este comando es solo para administradores.' },
          { quoted: m }
        )
      }

      const mentions = participants.map(p => p.id)
      const textTag = args.length > 0 ? args.join(' ') : 'ATENCIÓN A TODOS 📢'

      const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

      if (quotedMsg) {
        await sock.sendMessage(
          m.key.remoteJid,
          { ...quotedMsg, mentions: mentions },
          { quoted: m }
        )
      } else {
        await sock.sendMessage(
          m.key.remoteJid,
          {
            text: textTag,
            mentions: mentions
          },
          { quoted: m }
        )
      }

    } catch (e) {
      console.error('Error en Tagall invisible:', e)
    }
  }
}
