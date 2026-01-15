import APIs from '../lib/apis.js'

const cache = {}

export default {
  command: ['pin', 'pinterest'],
  category: 'busqueda',
  description: 'Busca imágenes en Pinterest y envía un álbum de 10 imágenes aleatorias',
  group: true,

  execute: async ({ sock, m, text }) => {
    try {
      if (!text?.trim()) {
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ Ingresa una palabra clave para buscar.' },
          { quoted: m }
        )
      }

      const query = text.toLowerCase()
      if (!cache[query]) cache[query] = []

      let images = []

      for (const endpoint of APIs.pinterest.search) {
        try {
          const res = await fetch(`${endpoint}${encodeURIComponent(query)}`)
          if (!res.ok) continue
          const data = await res.json()

          let urls = []
          if (data.result) urls = data.result.map(i => i.url || i.image || i.thumbnail).filter(Boolean)
          if (!urls.length && data.data) urls = data.data.map(i => i.url || i.image || i.thumbnail).filter(Boolean)
          if (!urls.length && Array.isArray(data)) urls = data.map(i => i.url || i.image || i.thumbnail).filter(Boolean)

          images.push(...urls)
        } catch {}
      }

      images = [...new Set(images)]
      if (!images.length) throw new Error('No se encontraron imágenes.')

      const newImages = images.filter(url => !cache[query].includes(url))
      if (!newImages.length) {
        cache[query] = []
        throw new Error('Se agotaron imágenes nuevas, intenta de nuevo.')
      }

      const selected = newImages.sort(() => 0.5 - Math.random()).slice(0, 10)
      cache[query].push(...selected)

      const album = selected.map(url => ({ image: { url } }))

      await sock.sendMessage(
        m.key.remoteJid,
        { media: album },
        { quoted: m }
      )

    } catch (e) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `❌ Error al buscar imágenes: ${e.message}` },
        { quoted: m }
      )
    }
  }
}
