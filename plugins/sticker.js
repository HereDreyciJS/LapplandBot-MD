import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers mediante buffer directo',
  execute: async ({ sock, m, pushName }) => {
    try {
      const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

      let msg = quoted || m.message

      // Manejar viewOnce
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

      const response = await fetch(
        'https://api.boxmine.xyz/api/maker/sticker',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: buffer.toString('base64'),
            packname: 'LapplandBot-MD',
            author: pushName || 'Usuario'
          })
        }
      )

      if (!response.ok) {
        throw new Error(`API error ${response.status}`)
      }

      const json = await response.json()

      if (!json.status || !json.result) {
        throw new Error('La API no devolvió sticker')
      }

      await sock.sendMessage(
        m.key.remoteJid,
        { sticker: Buffer.from(json.result, 'base64') },
        { quoted: m }
      )

    } catch (e) {
      console.error('Error en Sticker:', e)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `❌ Error: ${e.message}` },
        { quoted: m }
      )
    }
  }
}
