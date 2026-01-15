import APIs from '../lib/apis.js'

export default {
  command: ['pin', 'pinterest'],
  category: 'busqueda',
  group: true,

  execute: async ({ sock, m, text, isGroup }) => {
    if (!isGroup) return
    if (!text?.trim()) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: 'Ingresa un término de búsqueda.' },
        { quoted: m }
      )
    }

    try {
      await sock.sendMessage(
        m.key.remoteJid,
        { react: { text: '🕒', key: m.key } }
      )

      const endpoints = [...APIs.pinterest.search].sort(() => Math.random() - 0.5)
      const images = new Set()

      for (const base of endpoints) {
        if (images.size >= 10) break
        const res = await fetch(base + encodeURIComponent(text))
        if (!res.ok) continue
        const data = await res.json()

        const results =
          data.result ||
          data.results ||
          data.data ||
          []

        for (const item of results) {
          const url =
            item.url ||
            item.image ||
            item.images?.original ||
            item.images?.large ||
            item.images?.medium

          if (typeof url === 'string' && /^https?:\/\//.test(url)) {
            images.add(url)
          }
          if (images.size >= 10) break
        }
      }

      if (images.size === 0) throw 'Error al buscar imágenes'

      const media = [...images]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(url => ({ image: { url } }))

      await sock.sendMessage(
        m.key.remoteJid,
        { media },
        { quoted: m }
      )

      await sock.sendMessage(
        m.key.remoteJid,
        { react: { text: '✔️', key: m.key } }
      )

    } catch {
      await sock.sendMessage(
        m.key.remoteJid,
        { react: { text: '✖️', key: m.key } }
      )
      await sock.sendMessage(
        m.key.remoteJid,
        { text: 'Error al buscar imágenes' },
        { quoted: m }
      )
    }
  }
}
