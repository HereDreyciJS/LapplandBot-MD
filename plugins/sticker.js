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

      // Descargar contenido
      const stream = await downloadContentFromMessage(
        msg[mimeType],
        mimeType.replace('Message', '').toLowerCase()
      )
      
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      // Convertir a base64 y hacer la petición correcta
      const base64 = buffer.toString('base64')
      const response = await fetch(
        `https://api.lolhuman.xyz/api/stickerwp?apikey=GataDios&img=data:image/jpeg;base64,${base64}`
      )

      if (!response.ok) {
        throw new Error(`API respondió con status ${response.status}`)
      }

      const stiker = await response.buffer()

      // Enviar sticker
      await sock.sendMessage(m.key.remoteJid, { 
        sticker: stiker 
      }, { quoted: m })

    } catch (e) {
      console.error('Error en Sticker:', e)
      await sock.sendMessage(m.key.remoteJid, { 
        text: `❌ No se pudo crear el sticker: ${e.message}` 
      }, { quoted: m })
    }
  }
}
