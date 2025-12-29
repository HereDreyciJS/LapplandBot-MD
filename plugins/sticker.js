import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers mediante buffer directo',
  execute: async ({ sock, m, pushName }) => {
    try {
      let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      let msg = quoted ? quoted : m.message
      let mimeType = Object.keys(msg).find(v => v.includes('Message'))

      if (!mimeType || !/image|video/.test(mimeType)) {
        return sock.sendMessage(m.key.remoteJid, { 
          text: 'Responde a una imagen o video corto.' 
        }, { quoted: m })
      }

      const stream = await downloadContentFromMessage(
        msg[mimeType],
        mimeType.replace('Message', '').toLowerCase()
      )
      
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      // Nueva API: Boxmine (Aitana)
      const response = await fetch('https://api.boxmine.xyz/api/maker/sticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: buffer.toString('base64'),
          packname: 'LapplandBot-MD',
          author: pushName
        })
      })

      const json = await response.json()

      if (json.status && json.result) {
        await sock.sendMessage(m.key.remoteJid, { 
          sticker: Buffer.from(json.result, 'base64') 
        }, { quoted: m })
      } else {
        throw new Error('La API no devolvió un resultado válido')
      }

    } catch (e) {
      console.error('Error en Sticker:', e)
      await sock.sendMessage(m.key.remoteJid, { 
        text: `❌ Error: ${e.message}` 
      }, { quoted: m })
    }
  }
}
