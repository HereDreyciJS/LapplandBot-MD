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

      const response = await fetch(`https://api.siputzx.my.id/api/dwnld/ytmp3?url=${video.url}`)
      const json = await response.json()

      if (!json.status || !json.data?.dl) {
        throw new Error('Fallo en la descarga')
      }

      await sock.sendMessage(
        m.key.remoteJid,
        {
          audio: { url: json.data.dl },
          mimetype: 'audio/mp4',
          fileName: `${video.title}.mp3`
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
      sock.sendMessage(m.key.remoteJid, { text: 'Error al obtener el audio. Intenta de nuevo más tarde ❌' }, { quoted: m })
    }
  }
}
