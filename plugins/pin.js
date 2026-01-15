import APIs from '../lib/apis.js'

export default {
  command: ['pin','pinterest','pins'],
  category: 'busqueda',
  description: 'Busca imágenes de Pinterest y las envía en un álbum',
  group: true,

  execute: async ({ sock, m, text }) => {
    try {
      if (!text?.trim()) return sock.sendMessage(m.key.remoteJid, { text: '❌ Ingresa una palabra clave.' }, { quoted: m })

      const query = encodeURIComponent(text)
      let images = []

      for (let api of APIs.pinterest.search) {
        try {
          const res = await fetch(`${api}${query}`).then(r => r.json())
          const results = res?.result || res?.data || res?.images || []
          if (results.length > 0) {
            const urls = [...new Set(results.map(r => r.url || r.image || r.thumbnail).filter(Boolean))]
            if (urls.length > 0) {
              images = urls
              break
            }
          }
        } catch {}
      }

      if (!images.length) throw '❌ No se encontraron imágenes.'

      images = shuffleArray(images).slice(0, 10)

      const messages = []
      for (let url of images) {
        try {
          const buffer = Buffer.from(await fetch(url).then(res => res.arrayBuffer()))
          messages.push({ image: buffer })
        } catch {}
      }

      if (!messages.length) throw '❌ No se pudieron cargar las imágenes.'

      await sock.sendMessage(m.key.remoteJid, { messages }, { quoted: m })

    } catch (e) {
      await sock.sendMessage(m.key.remoteJid, { text: typeof e === 'string' ? e : '⚠ Error al buscar imágenes.' }, { quoted: m })
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
