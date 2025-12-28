import fetch from 'node-fetch'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers mediante API externa',
  execute: async ({ sock, m, pushName }) => {
    try {
      let q = m.quoted ? m.quoted : m
      let mime = (q.msg || q).mimetype || ''

      if (!/image|video/.test(mime)) {
        return sock.sendMessage(m.key.remoteJid, { text: 'Responde a una imagen o video corto.' }, { quoted: m })
      }

      let img = await q.download()
      if (!img) return

      // Usamos una API de conversión externa que acepta buffers
      // Esta API convierte tu imagen/video a un sticker WebP con metadatos
      const response = await fetch('https://api.sticker-api.com/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: img.toString('base64'),
          packname: 'LapplandBot-MD',
          author: pushName,
          type: 'full' // o 'crop' para recortar
        })
      })

      const json = await response.json()

      if (json.sticker) {
        let stikerBuffer = Buffer.from(json.sticker, 'base64')
        await sock.sendMessage(m.key.remoteJid, { sticker: stikerBuffer }, { quoted: m })
      } else {
        await sock.sendMessage(m.key.remoteJid, { text: '❌ La API no pudo procesar el sticker.' }, { quoted: m })
      }

    } catch (e) {
      console.error(e)
      await sock.sendMessage(m.key.remoteJid, { text: '❌ Error de conexión con la API de stickers.' }, { quoted: m })
    }
  }
}
