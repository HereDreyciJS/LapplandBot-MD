import APIs from '../lib/apis.js'

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

      const apis = APIs.pinterest.search
      let data, lastError

      for (const endpoint of apis) {
        try {
          const res = await fetch(`${endpoint}${encodeURIComponent(text)}`)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          data = await res.json()
          if (data?.result?.length || data?.data?.length) break
        } catch (err) {
          lastError = err
          continue
        }
      }

      if (!data) throw lastError || new Error('No se pudo obtener resultados.')

      let images = data.result || data.data || []
      images = images.map(i => i.url || i.image || i.thumbnail).filter(Boolean)
      images = [...new Set(images)]

      if (!images.length) throw new Error('No se encontraron imágenes.')

      const shuffled = images.sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, 10)

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
