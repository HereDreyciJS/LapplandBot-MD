import fetch from 'node-fetch'

export default {
  command: ['pin', 'pinterest'],
  description: 'Busca imágenes aleatorias en Pinterest',
  execute: async ({ sock, m, args }) => {
    try {
      if (!args.length) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ Escribe una palabra para buscar en Pinterest.' },
          { quoted: m }
        )
      }

      const query = args.join(' ')
      const url = `https://pinterest.downloaderapi.com/api/search?query=${encodeURIComponent(query)}`

      const res = await fetch(url)
      const data = await res.json()

      if (!data?.images || !data.images.length) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ No se encontraron imágenes.' },
          { quoted: m }
        )
      }

      const imageUrl = data.images[Math.floor(Math.random() * data.images.length)]

      await sock.sendMessage(
        m.key.remoteJid,
        {
          image: { url: imageUrl },
          caption: `📌 Resultado de Pinterest\n🔎 ${query}`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error('Error Pinterest:', e)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Ocurrió un error al buscar en Pinterest.' },
        { quoted: m }
      )
    }
  }
}
