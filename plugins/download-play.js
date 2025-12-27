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

      // Intento 1: Siputzx
      try {
        const resSiput = await fetch(`https://api.siputzx.my.id/api/dwnld/ytmp3?url=${video.url}`)
        const jsonSiput = await resSiput.json()
        if (jsonSiput.status && jsonSiput.data?.dl) {
          downloadUrl = jsonSiput.data.dl
        }
      } catch (e) {
        console.log('Error en Siputzx, probando Vreden...')
      }

      // Intento 2: Vreden (si el primero falló)
      if (!downloadUrl) {
        try {
          const resVreden = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${video.url}`)
          const jsonVreden = await resVreden.json()
          if (jsonVreden.status && jsonVreden.result?.download?.url) {
            downloadUrl = jsonVreden.result.download.url
          }
        } catch (e) {
          console.log('Error en Vreden')
        }
      }

      if (!downloadUrl) {
        return sock.sendMessage(m.key.remoteJid, { text: 'Ambas APIs están caídas, intenta más tarde ❌' }, { quoted: m })
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
      sock.sendMessage(m.key.remoteJid, { text: 'Ocurrió un error inesperado al procesar el comando ❌' }, { quoted: m })
    }
  }
}
