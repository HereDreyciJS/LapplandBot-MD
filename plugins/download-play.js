import fetch from 'node-fetch'
import yts from 'yt-search'

export default {
  command: ['play'],
  description: 'Descarga música de YouTube',
  execute: async ({ sock, m, args }) => {
    if (args.length === 0) return sock.sendMessage(m.key.remoteJid, { text: '¿Qué canción quieres escuchar? 🎶' }, { quoted: m })

    const text = args.join(' ')
    try {
      const search = await yts(text)
      const video = search.videos[0]
      if (!video) return sock.sendMessage(m.key.remoteJid, { text: 'No encontré resultados 😿' }, { quoted: m })

      await sock.sendMessage(m.key.remoteJid, { text: `⏳ Buscando y descargando: *${video.title}*...` }, { quoted: m })

      let downloadUrl = null

      // Intento 1: API de AlyaChan (Muy estable actualmente)
      try {
        const res1 = await fetch(`https://api.alyachan.dev/api/ytmp3?url=${video.url}&apikey=GataDios`)
        const json1 = await res1.json()
        if (json1.status && json1.data?.url) downloadUrl = json1.data.url
      } catch (e) {}

      // Intento 2: API de Ryzendesu (Backup)
      if (!downloadUrl) {
        try {
          const res2 = await fetch(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${video.url}`)
          const json2 = await res2.json()
          if (json2.url) downloadUrl = json2.url
        } catch (e) {}
      }

      // Intento 3: API de Tostadora (Emergencia)
      if (!downloadUrl) {
        try {
          const res3 = await fetch(`https://api.tostadora.org/api/ytdl/mp3?url=${encodeURIComponent(video.url)}`)
          const json3 = await res3.json()
          if (json3.url) downloadUrl = json3.url
        } catch (e) {}
      }

      if (!downloadUrl) {
        return sock.sendMessage(m.key.remoteJid, { text: 'Todas las rutas de descarga están saturadas por ahora. Intenta de nuevo en unos minutos ❌' }, { quoted: m })
      }

      await sock.sendMessage(
        m.key.remoteJid,
        {
          audio: { url: downloadUrl },
          mimetype: 'audio/mp4',
          fileName: `${video.title}.mp3`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      sock.sendMessage(m.key.remoteJid, { text: 'Error inesperado. Verifica tu conexión.' }, { quoted: m })
    }
  }
}
