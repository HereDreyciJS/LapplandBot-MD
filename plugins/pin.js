import fetch from 'node-fetch'
import APIs from '../lib/apis.js'

export default {
  command: ['pin', 'pinterest'],
  category: 'descargas',
  group: true,
  description: 'Busca imágenes en Pinterest por palabra clave',

  execute: async ({ sock, m, text, isGroup }) => {
    try {
      if (!isGroup) return
      if (!text?.trim()) return sock.sendMessage(m.key.remoteJid, { text: '❀ Ingresa una palabra clave.' }, { quoted: m })

      await sock.sendMessage(m.key.remoteJid, { react: { text: '🕒', key: m.key } })

      const searchApis = APIs.pinterest.search
      const randomApi = searchApis[Math.floor(Math.random() * searchApis.length)]
      const url = randomApi + encodeURIComponent(text)

      const res = await fetch(url).then(r => r.json())
      let images = []
      if (res.data) images = res.data
      else if (res.result) images = res.result
      else if (res.items) images = res.items
      if (!images.length) throw '❌ No se encontraron imágenes.'

      const imageUrl = images[Math.floor(Math.random() * images.length)].media || images[Math.floor(Math.random() * images.length)].url

      await sock.sendMessage(m.key.remoteJid, { image: { url: imageUrl }, caption: `❀ Resultado de: ${text}` }, { quoted: m })
      await sock.sendMessage(m.key.remoteJid, { react: { text: '✔️', key: m.key } })

    } catch (e) {
      await sock.sendMessage(m.key.remoteJid, { react: { text: '✖️', key: m.key } })
      await sock.sendMessage(m.key.remoteJid, { text: typeof e === 'string' ? e : '⚠ Error al buscar imágenes.' }, { quoted: m })
    }
  }
}
