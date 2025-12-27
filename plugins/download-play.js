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

      await sock.sendMessage(m.key.remoteJid, { text: `⏳ Procesando: *${video.title}*...` }, { quoted: m })

      let downloadUrl = null

      // Intento 1: GawrGura API
      try {
        const resGura = await fetch(`https://gawrgura-api.onrender.com/api/download/ytmp3?url=${video.url}`)
        const jsonGura = await resGura.json()
        if (jsonGura.status && jsonGura.result?.download?.url) {
          downloadUrl = jsonGura.result.download.url
        }
      } catch (e) {
        console.log('Error en GawrGura, probando Dark-Core...')
      }

      // Intento 2: Dark-Core API
      if (!downloadUrl) {
        try {
          const resDark = await fetch(`https://dark-core-api.vercel.app/api/download/ytmp3/v2?key=api&url=${video.url}`)
          const jsonDark = await resDark.json()
          if (jsonDark.status && jsonDark.result?.download?.url) {
            downloadUrl = jsonDark.result.download.url
          }
        } catch (e) {
          console.log('Error en Dark-Core')
        }
      }

      if (!downloadUrl) {
        return sock.sendMessage(m.key.remoteJid, { text: 'Ambas APIs de descarga están fallando en este momento ❌' }, { quoted: m })
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
      sock.sendMessage(m.key.remoteJid, { text: 'Ocurrió un error inesperado ❌' }, { quoted: m })
    }
  }
}
