import fetch from 'node-fetch'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers con base propia',
  execute: async ({ sock, m, pushName }) => {
    try {
      // 1. Detectar si es un mensaje con imagen/video o un citado
      let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      let msg = quoted ? quoted : m.message
      
      // 2. Extraer el tipo de mensaje (imageMessage, videoMessage, etc)
      let mimeType = Object.keys(msg)[0]
      let mediaData = msg[mimeType]

      if (!/image|video/.test(mimeType) && !/image|video/.test(mediaData?.mimetype || '')) {
        return sock.sendMessage(m.key.remoteJid, { text: 'Responde a una imagen o video con /s' }, { quoted: m })
      }

      // 3. Descargar usando la función nativa de Baileys
      const stream = await downloadContentFromMessage(
        mediaData,
        mimeType.replace('Message', '')
      )
      
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      // 4. Enviar a la API de conversión
      const response = await fetch('https://api.sticker-api.com/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: buffer.toString('base64'),
          packname: 'LapplandBot-MD',
          author: pushName,
          type: 'full'
        })
      })

      const json = await response.json()

      if (json.sticker) {
        await sock.sendMessage(m.key.remoteJid, { 
          sticker: Buffer.from(json.sticker, 'base64') 
        }, { quoted: m })
      }

    } catch (e) {
      console.error('Error en Sticker:', e)
      await sock.sendMessage(m.key.remoteJid, { text: '❌ Error al procesar: Asegúrate de que sea una imagen o video corto.' }, { quoted: m })
    }
  }
}
