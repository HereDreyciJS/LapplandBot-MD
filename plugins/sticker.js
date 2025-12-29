import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Sticker } from 'wa-sticker-formatter'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers localmente',
  execute: async ({ sock, m, pushName }) => {
    try {
      let quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

      let msg = quoted || m.message

      if (msg?.viewOnceMessageV2) {
        msg = msg.viewOnceMessageV2.message
      }

      if (!msg?.imageMessage) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: 'Responde a una imagen.' },
          { quoted: m }
        )
      }

      const stream = await downloadContentFromMessage(
        msg.imageMessage,
        'image'
      )

      let buffer = Buffer.alloc(0)
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      const sticker = new Sticker(buffer, {
        pack: 'LapplandBot-MD',
        author: pushName || 'Usuario',
        type: 'full',
        quality: 80
      })

      await sock.sendMessage(
        m.key.remoteJid,
        { sticker: await sticker.toBuffer() },
        { quoted: m }
      )

    } catch (e) {
      console.error('Error en Sticker:', e)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `❌ Error creando sticker` },
        { quoted: m }
      )
    }
  }
}
