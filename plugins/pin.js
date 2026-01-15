import APIs from '../lib/apis.js'

export default {
  command: ['pinterest', 'pin'],
  category: 'busquedas',
  group: true,

  execute: async ({ sock, m, text, isGroup }) => {
    if (!isGroup) return
    if (!text?.trim()) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❀ Ingresa un término de búsqueda.' },
        { quoted: m }
      )
    }

    try {
      await sock.sendMessage(
        m.key.remoteJid,
        { react: { text: '🕒', key: m.key } }
      )

      const query = encodeURIComponent(text.trim())
      const endpoints = APIs.pinterest.search.map(e => e + query)

      let images = []

      for (const url of shuffle(endpoints)) {
        try {
          const res = await fetch(url)
          if (!res.ok) continue
          const data = await res.json()

          const list =
            data.result ||
            data.results ||
            data.data ||
            data.images ||
            []

          const urls = list
            .map(v => v.url || v.image || v.images?.original || v.images?.url)
            .filter(Boolean)

          images.push(...urls)
          if (images.length >= 10) break
        } catch {}
      }

      images = [...new Set(images)]
      images = shuffle(images).slice(0, 10)

      if (!images.length) {
        throw 'No se encontraron imágenes'
      }

      const media = images.map(url => ({
        image: { url }
      }))

      await sock.sendMessage(
        m.key.remoteJid,
        {
          media,
          caption: `❀ Resultados de Pinterest: ${text}`
        },
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

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5)
}
