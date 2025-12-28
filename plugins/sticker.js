import fetch from 'node-fetch'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers mediante API externa',
  execute: async ({ sock, m, pushName }) => {
    try {
      // Intentamos obtener el mensaje citado o el mensaje actual
      let q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage ? m.message.extendedTextMessage.contextInfo.quotedMessage : m.message
      
      // Buscamos el tipo de contenido (imagen o video)
      let type = Object.keys(q)[0]
      let msg = q[type]
      let mime = msg?.mimetype || ''

      if (!/image|video/.test(mime)) {
        return sock.sendMessage(m.key.remoteJid, { 
          text: `❌ *Error:* No detecto ninguna imagen o video.\n\nResponde a una imagen con */s* o envíala con el comando en el texto.` 
        }, { quoted: m })
      }

      // Descargamos el contenido usando la función de sock
      // Si tu base usa 'm.download()', cámbialo aquí:
      let img = await sock.downloadMediaMessage(q)
      if (!img) return

      const response = await fetch('https://api.sticker-api.com/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: img.toString('base64'),
          packname: 'LapplandBot-MD',
          author: pushName,
          type: 'full'
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
      await sock.sendMessage(m.key.remoteJid, { text: '❌ Asegúrate de estar respondiendo a una imagen o video.' }, { quoted: m })
    }
  }
}
