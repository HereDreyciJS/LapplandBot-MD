import fetch from 'node-fetch'

export default {
  command: ['pin', 'pinterest'],
  description: 'Busca imágenes de Pinterest',
  execute: async ({ sock, m, text }) => {
    try {
      if (!text) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ Usa el comando así:\n/pin aesthetic' },
          { quoted: m }
        )
      }

      const url = `https://pinterest-api.vercel.app/?q=${encodeURIComponent(text)}`
      const res = await fetch(url)
      const data = await res.json()

      if (!Array.isArray(data) || data.length === 0) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ No se encontraron imágenes.' },
          { quoted: m }
        )
      }

      const image = data[Math.floor(Math.random() * data.length)]

      await sock.sendMessage(
        m.key.remoteJid,
        {
          image: { url: image },
          caption: `📌 *Pinterest*\n🔎 *${text}*`
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Error al buscar en Pinterest.' },
        { quoted: m }
      )
    }
  }
}
