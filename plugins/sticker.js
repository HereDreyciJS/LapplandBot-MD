import { sticker } from '../lib/sticker.js'
import { uploadFile } from '../lib/uploadFile.js'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Convierte imágenes o videos en stickers',
  execute: async ({ sock, m, pushName }) => {
    try {
      let q = m.quoted ? m.quoted : m
      let mime = (q.msg || q).mimetype || ''

      if (!/image|video/.test(mime)) {
        return sock.sendMessage(m.key.remoteJid, { 
          text: `Responde a una imagen o video con el comando */s* para crear un sticker.` 
        }, { quoted: m })
      }

      let img = await q.download()
      if (!img) throw 'No se pudo descargar el contenido'

      let stiker = false
      try {
        // Generar sticker con metadatos de LapplandBot
        stiker = await sticker(img, false, 'LapplandBot-MD', pushName)
      } catch (e) {
        console.error('Error en conversión local:', e)
      }

      if (!stiker) {
        let link = await uploadFile(img)
        stiker = await sticker(false, link, 'LapplandBot-MD', pushName)
      }

      if (stiker) {
        await sock.sendMessage(m.key.remoteJid, { sticker: stiker }, { quoted: m })
      } else {
        throw 'La conversión falló'
      }

    } catch (e) {
      console.error(e)
      await sock.sendMessage(m.key.remoteJid, { 
        text: '❌ Hubo un fallo al procesar el sticker. Asegúrate de que el video sea corto (menos de 7 seg).' 
      }, { quoted: m })
    }
  }
}
