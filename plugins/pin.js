export default {
  command: ['pin', 'pinterest'],
  description: 'Busca imágenes aleatorias de Pinterest',
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
      const url = `https://pinscrapper.vercel.app/api/pinterest/search?q=${encodeURIComponent(query)}&limit=10`

      const res = await fetch(url)
      const json = await res.json()

      if (!json?.results?.length) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ No se encontraron imágenes.' },
          { quoted: m }
        )
      }

      const random = json.results[Math.floor(Math.random() * json.results.length)]
      const imageUrl = random.url ?? random.image ?? random.mediaUrl ?? random.images?.[0]

      if (!imageUrl) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ Imagen inválida recibida.' },
          { quoted: m }
        )
      }

      await sock.sendMessage(
        m.key.remoteJid,
        {
          image: { url: imageUrl },
          caption: `📌 ${query}`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error('Error Pinterest:', e)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Error al buscar en Pinterest.' },
        { quoted: m }
      )
    }
  }
}
