import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import { FormData } from 'formdata-node' // Si no la tienes, usaremos una alternativa más simple abajo

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers con API alternativa',
  execute: async ({ sock, m, pushName }) => {
    try {
      let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      let msg = quoted ? quoted : m.message
      let mimeType = Object.keys(msg).find(v => v.includes('Message'))

      if (!mimeType || !/image|video/.test(mimeType)) {
        return sock.sendMessage(m.key.remoteJid, { text: 'Responde a una imagen o video corto.' }, { quoted: m })
      }

      // 1. Descargamos el buffer
      const stream = await downloadContentFromMessage(
        msg[mimeType],
        mimeType.replace('Message', '').toLowerCase()
      )
      
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      // 2. Usamos una API que acepta buffers directos (Aitana API)
      // Esta API convierte automáticamente a WebP
      const res = await fetch('https://api.boxmine.xyz/api/maker/sticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: buffer.toString('base64'),
          packname: 'LapplandBot',
          author: pushName || 'Dreyci'
        })
      })

      const json = await res.json()

      if (json.status && json.result) {
        // La API devuelve el buffer en base64 o una URL
        const stikerBuffer = Buffer.from(json.result, 'base64')
        
        await sock.sendMessage(m.key.remoteJid, { 
          sticker: stikerBuffer 
        }, { quoted: m })
      } else {
        // Si esa falla, intentamos con una URL directa de conversión rápida
        const resAlt = await fetch('https://api.shizuka.site/sticker', {
            method: 'POST',
            body: buffer
        })
        const finalSticker = await resAlt.buffer()
        await sock.sendMessage(m.key.remoteJid, { sticker: finalSticker }, { quoted: m })
      }

    } catch (e) {
      console.error('Error en Sticker:', e)
      await sock.sendMessage(m.key.remoteJid, { text: '❌ Las APIs están saturadas. Intenta con una imagen más pequeña.' }, { quoted: m })
    }
  }
}
