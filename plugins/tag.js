import fs from 'fs'
import path from 'path'
import os from 'os'
import fetch from 'node-fetch'

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
          const buffer = await sock.downloadMediaMessage({ message: { imageMessage: quoted.imageMessage } })
          msg = {
            image: buffer,
            caption: quoted.imageMessage.caption || undefined,
            mentions
          }
        } else if (quoted.videoMessage) {
          const buffer = await sock.downloadMediaMessage({ message: { videoMessage: quoted.videoMessage } })
          msg = {
            video: buffer,
            caption: quoted.videoMessage.caption || undefined,
            mimetype: quoted.videoMessage.mimetype,
            gifPlayback: quoted.videoMessage.gifPlayback || false,
            mentions
          }
        } else if (quoted.stickerMessage) {
          const buffer = await sock.downloadMediaMessage({ message: { stickerMessage: quoted.stickerMessage } })
          msg = {
            sticker: buffer,
            mentions
          }
        } else if (quoted.documentMessage) {
          const buffer = await sock.downloadMediaMessage({ message: { documentMessage: quoted.documentMessage } })
          msg = {
            document: buffer,
            fileName: quoted.documentMessage.fileName || 'file',
            mimetype: quoted.documentMessage.mimetype,
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
