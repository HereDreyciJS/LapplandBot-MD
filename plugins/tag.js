import { downloadContentFromMessage, proto } from '@whiskeysockets/baileys'
import { Buffer } from 'buffer'

async function downloadMedia(message) {
  const type = Object.keys(message)[0]
  const stream = await downloadContentFromMessage(message[type], type.replace('Message','').toLowerCase())
  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }
  return buffer
}

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
        } else if (quoted.imageMessage || quoted.videoMessage || quoted.stickerMessage || quoted.documentMessage) {
          const typeKey = Object.keys(quoted)[0]
          const buffer = await downloadMedia(quoted)
          if (typeKey === 'imageMessage') {
            msg = { image: buffer, caption: quoted.imageMessage.caption || undefined, mentions }
          } else if (typeKey === 'videoMessage') {
            msg = { video: buffer, caption: quoted.videoMessage.caption || undefined, mimetype: quoted.videoMessage.mimetype, gifPlayback: quoted.videoMessage.gifPlayback || false, mentions }
          } else if (typeKey === 'stickerMessage') {
            msg = { sticker: buffer, mentions }
          } else if (typeKey === 'documentMessage') {
            msg = { document: buffer, fileName: quoted.documentMessage.fileName || 'file', mimetype: quoted.documentMessage.mimetype, mentions }
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
