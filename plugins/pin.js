import fetch from 'node-fetch'
import APIs from '../lib/apis.js'

export default {
  command: ['pin','pinterest'],
  execute: async ({ sock, m, text }) => {
    try {
      if (!text) throw '❌ Escribe una búsqueda'

      const query = encodeURIComponent(text)
      let urls = []

      for (const api of APIs.pinterest.search) {
        try {
          const res = await fetch(api + query)
          if (!res.ok) continue

          const json = await res.json()
          const data =
            json.result ||
            json.data ||
            json.images ||
            json.media ||
            []

          if (!Array.isArray(data)) continue

          for (const i of data) {
            const u = i.url || i.image || i.images?.[0]
            if (typeof u === 'string') urls.push(u)
          }

          if (urls.length >= 20) break
        } catch {}
      }

      urls = [...new Set(urls)]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)

      if (!urls.length) throw '❌ No se encontraron imágenes'

      const album = []

      for (const url of urls) {
        try {
          const res = await fetch(url)
          if (!res.ok) continue

          const type = res.headers.get('content-type')
          if (!type?.startsWith('image/')) continue

          const buffer = Buffer.from(await res.arrayBuffer())
          album.push({ image: buffer })
        } catch {}
      }

      if (!album.length) throw '❌ Ninguna imagen válida'

      await sock.sendMessage(
        m.key.remoteJid,
        { messages: album },
        { quoted: m }
      )

    } catch (err) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: typeof err === 'string' ? err : 'Error al buscar imágenes' },
        { quoted: m }
      )
    }
  }
}
