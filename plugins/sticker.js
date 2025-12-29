import {
  downloadContentFromMessage,
  getContentType,
  normalizeMessageContent
} from '@whiskeysockets/baileys'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers',
  execute: async ({ sock, m }) => {
    try {
      const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const raw = q ?? m.message
      const msg = normalizeMessageContent(raw)
      const type = getContentType(msg)

      if (type !== 'imageMessage' && type !== 'videoMessage') {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: 'Responde a una imagen o video corto.' },
          { quoted: m }
        )
      }

      const stream = await downloadContentFromMessage(
        msg[type],
        type === 'imageMessage' ? 'image' : 'video'
      )

      let buffer = Buffer.alloc(0)
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

      await sock.sendMessage(
        m.key.remoteJid,
        { sticker: buffer },
        { quoted: m }
      )

    } catch (e) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Error al crear el sticker' },
        { quoted: m }
      )
    }
  }
}
