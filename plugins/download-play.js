import fetch from 'node-fetch'
import yts from 'yt-search'

export default {
  command: ['play'],
  description: 'Descarga música de YouTube',
  execute: async ({ sock, m, args }) => {
    if (args.length === 0) return sock.sendMessage(m.key.remoteJid, { text: '¿Qué canción quieres? 🎶' }, { quoted: m })

    const text = args.join(' ')
    try {
      const search = await yts(text)
      const video = search.videos[0]
      if (!video) return sock.sendMessage(m.key.remoteJid, { text: 'No encontré nada 😿' }, { quoted: m })

      await sock.sendMessage(m.key.remoteJid, { text: `⏳ Descargando: *${video.title}*...` }, { quoted: m })

      const api = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${video.url}`)
      const textResponse = await api.text() // Leemos primero como texto para evitar el crash

      let res
      try {
        res = JSON.parse(textResponse)
      } catch (e) {
        return sock.sendMessage(m.key.remoteJid, { text: 'El servidor de descarga está caído, intenta de nuevo en un momento.' }, { quoted: m })
      }

      if (!res.status || !res.result?.download?.url) {
        return sock.sendMessage(m.key.remoteJid, { text: 'No se pudo obtener el enlace de descarga ❌' }, { quoted: m })
      }

      await sock.sendMessage(
        m.key.remoteJid,
        {
          audio: { url: res.result.download.url },
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
