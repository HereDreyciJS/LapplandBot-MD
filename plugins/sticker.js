import fetch from 'node-fetch'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers con procesamiento local/externo',
  execute: async ({ sock, m, pushName }) => {
    try {
      // 1. Obtener el mensaje con multimedia
      let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      let msg = quoted ? quoted : m.message
      let mimeType = Object.keys(msg).find(key => key.includes('Message'))
      
      if (!mimeType || !/image|video/.test(mimeType)) {
        return sock.sendMessage(m.key.remoteJid, { text: 'Responde a una imagen o video con /s' }, { quoted: m })
      }

      // 2. Descargar el buffer
      const stream = await downloadContentFromMessage(
        msg[mimeType],
        mimeType.replace('Message', '').toLowerCase()
      )
      
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      // 3. Usar una API alternativa más confiable (o intentar local)
      // Esta API es muy robusta para stickers
      const res = await fetch('https://api.lolhuman.xyz/api/stickerwp?apikey=GataDios', {
        method: 'POST',
        body: buffer
      })

      // Si la API falla por red, el buffer de la imagen ya lo tienes
      if (res.ok) {
        const stikerBuffer = await res.buffer()
        await sock.sendMessage(m.key.remoteJid, { 
          sticker: stikerBuffer 
        }, { quoted: m })
      } else {
        throw 'Error en la respuesta de la API'
      }

    } catch (e) {
      console.error('Error en Sticker:', e)
      await sock.sendMessage(m.key.remoteJid, { text: '❌ No se pudo conectar con el servidor de stickers. Inténtalo de nuevo.' }, { quoted: m })
    }
  }
}
