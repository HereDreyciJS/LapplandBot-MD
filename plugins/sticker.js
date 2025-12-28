import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Sticker, StickerTypes } from 'waifus-sticker'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers localmente',
  execute: async ({ sock, m, pushName }) => {
    try {
      // 1. Detectar el mensaje multimedia (Imagen o Video)
      let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      let msg = quoted ? quoted : m.message
      
      // Buscamos qué tipo de mensaje es
      let mimeType = Object.keys(msg).find(v => v.includes('Message'))

      if (!mimeType || !/image|video/.test(mimeType)) {
        return sock.sendMessage(m.key.remoteJid, { text: 'Responde a una imagen o video corto con */s*' }, { quoted: m })
      }

      // 2. Descargar el buffer directamente (Base propia)
      const stream = await downloadContentFromMessage(
        msg[mimeType],
        mimeType.replace('Message', '').toLowerCase()
      )
      
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      // 3. Crear el sticker usando waifus-sticker
      const stiker = new Sticker(buffer, {
        pack: 'LapplandBot-MD', 
        author: pushName || 'Dreyci',
        type: StickerTypes.FULL, 
        quality: 70 
      })

      const stikerBuffer = await stiker.toBuffer()

      // 4. Enviar el resultado
      await sock.sendMessage(m.key.remoteJid, { sticker: stikerBuffer }, { quoted: m })

    } catch (e) {
      console.error('Error en Sticker:', e)
      await sock.sendMessage(m.key.remoteJid, { text: '❌ Error: Asegúrate de instalar la librería con: npm install waifus-sticker' }, { quoted: m })
    }
  }
}
