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
        return sock.sendMessage(m.key.remoteJid, { text: 'Responde a una imagen o video corto.' }, { quoted: m })
      }

     
      const stream = await downloadContentFromMessage(
        msg[mimeType],
        mimeType.replace('Message', '').toLowerCase()
      )
      
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      
      const base64 = buffer.toString('base64')
      const response = await fetch('https://api.lolhuman.xyz/api/stickerwp?apikey=GataDios', {
        method: 'POST',
        body: buffer
      })

      if (!response.ok) throw new Error('Error en la API')

      const stiker = await response.buffer()

     
      await sock.sendMessage(m.key.remoteJid, { 
        sticker: stiker 
      }, { quoted: m })

    } catch (e) {
      console.error('Error en Sticker:', e)
      await sock.sendMessage(m.key.remoteJid, { text: '❌ No se pudo crear el sticker. Intenta con una imagen más pequeña.' }, { quoted: m })
    }
  }
}
