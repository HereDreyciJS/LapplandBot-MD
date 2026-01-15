import fetch from 'node-fetch'
import APIs from '../lib/apis.js'

export default {
  command: ['pin','pinterest'],
  group: true,

  execute: async ({ sock, m, text }) => {
    try {
      if (!text?.trim()) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ Escribe una palabra clave.' },
          { quoted: m }
        )
      }

      const query = encodeURIComponent(text)
      let urls = []

      for (const api of APIs.pinterest.search) {
        try {
          const res = await fetch(api + query)
          if (!res.ok) continue
          const json = await res.json()

          const raw =
            json.result ||
            json.data ||
            json.images ||
            json.media ||
            []

          if (Array.isArray(raw)) {
            for (const i of raw) {
              const u = i.url || i.image || i.images?.[0]
              if (typeof u === 'string') urls.push(u)
            }
          }

          if (urls.length >= 10) break
        } catch {}
      }

      urls = [...new Set(urls)]
        .sort(() => 0.5 - Math.random())
        .slice(0, 10)

      if (urls.length === 0) {
        throw '❌ No se encontraron imágenes.'
      }

      const album = []

      for (const u of urls) {
        const r = await fetch(u)
        if (!r.ok) continue
        const buf = Buffer.from(await r.arrayBuffer())
        album.push({ image: buf })
      }

      if (album.length === 0) {
        throw '❌ Error al procesar imágenes.'
      }

      await sock.sendMessage(
        m.key.remoteJid,
        { messages: album },
        { quoted: m }
      )

    } catch (e) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: typeof e === 'string' ? e : '❌ Error al buscar imágenes' },
        { quoted: m }
      )
    }
  }
}
