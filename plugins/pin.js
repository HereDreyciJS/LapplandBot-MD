import fetch from 'node-fetch'

export default {
  command: ['pin', 'pinterest'],
  description: 'Busca imágenes en Pinterest',
  execute: async ({ sock, m, text }) => {
    try {
      if (!text) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ Usa el comando así:\n/pin aesthetic' },
          { quoted: m }
        )
      }

      const apiKey = 'soblend-mgg4ch1sb'
      const url = `https://api/pinterest?q=${encodeURIComponent(text)}&apiKey=${apiKey}`

      const res = await fetch(url)
      const json = await res.json()

      if (!json || !json.result || json.result.length === 0) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ No se encontraron resultados.' },
          { quoted: m }
        )
      }

      const image = json.result[Math.floor(Math.random() * json.result.length)]

      await sock.sendMessage(
        m.key.remoteJid,
        {
          image: { url: image },
          caption: `📌 *Pinterest*\n🔎 Búsqueda: *${text}*`
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Error al obtener la imagen.' },
        { quoted: m }
      )
    }
  }
        }
