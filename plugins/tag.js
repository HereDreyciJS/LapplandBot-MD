export default {
  command: ['tag', 'tagall', 'todos'],
  description: 'Menciona a todos de forma invisible (Solo Admins) y responde a un mensaje',
  execute: async ({ sock, m, args }) => {
    try {
      if (!m.key.remoteJid.endsWith('@g.us')) return

      const groupMetadata = await sock.groupMetadata(m.key.remoteJid)
      const participants = groupMetadata.participants
      const admins = participants.filter(p => p.admin !== null).map(p => p.id)
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

      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

      if (quoted) {
        let msg = {}

        if (quoted.conversation) {
          msg = { text: quoted.conversation, mentions }
        } else if (quoted.imageMessage) {
          msg = { 
            image: { url: 'https://wa.me/' },
            caption: quoted.imageMessage.caption || textTag,
            mentions
          }
        } else if (quoted.videoMessage) {
          msg = { 
            video: { url: 'https://wa.me/' }, 
            caption: quoted.videoMessage.caption || textTag,
            mentions
          }
        } else if (quoted.stickerMessage) {
          msg = { 
            sticker: quoted.stickerMessage, 
            mentions
          }
        } else {
          msg = { text: textTag, mentions }
        }

        await sock.sendMessage(m.key.remoteJid, msg, { quoted: m })

      } else {
        await sock.sendMessage(
          m.key.remoteJid,
          { text: textTag, mentions },
          { quoted: m }
        )
      }

    } catch (e) {
      console.error('Error en Tagall invisible:', e)
    }
  }
}
