import fetch from 'node-fetch'
import APIs from '../lib/apis.js'

export default {
  command: ['pin','pinterest'],
  category: 'descargas',
  group: true,
  description: 'Busca imágenes en Pinterest por palabra clave',

  execute: async ({ sock, m, text, isGroup }) => {
    try {
      if (!isGroup) return
      if (!text?.trim()) return sock.sendMessage(m.key.remoteJid, { text: '❀ Ingresa una palabra clave.' }, { quoted: m })

      await sock.sendMessage(m.key.remoteJid, { react: { text: '🕒', key: m.key } })

      const searchApis = APIs.pinterest.search
      let imageUrl = null

      for (const api of searchApis.sort(() => Math.random() - 0.5)) {
        try {
          const res = await fetch(api + encodeURIComponent(text)).then(r => r.json())
          let images = []
          if (Array.isArray(res)) images = res
          else if (res.data) images = res.data
          else if (res.result) images = res.result
          else if (res.items) images = res.items
          for (const img of images.sort(() => Math.random() - 0.5)) {
            if (typeof img === 'string') { imageUrl = img; break }
            if (img.media) { imageUrl = img.media; break }
            if (img.url) { imageUrl = img.url; break }
            if (img.image) { imageUrl = img.image; break }
          }
          if (imageUrl) break
        } catch {}
      }

      if (!imageUrl) throw '❌ No se pudo obtener la imagen.'

      await sock.sendMessage(
        m.key.remoteJid,
        { image: { url: imageUrl }, caption: `❀ Resultado de: ${text}` },
        { quoted: m }
      )

      await sock.sendMessage(m.key.remoteJid, { react: { text: '✔️', key: m.key } })

    } catch (e) {
      await sock.sendMessage(m.key.remoteJid, { react: { text: '✖️', key: m.key } })
      await sock.sendMessage(
        m.key.remoteJid,
        { text: typeof e === 'string' ? e : '⚠ Error al buscar imágenes.' },
        { quoted: m }
      )
    }
  }
}
