import fetch from 'node-fetch'
import yts from 'yt-search'
import ytdl from '@distube/ytdl-core'

export default {
  command: ['play'],
  description: 'Descarga música de YouTube',
  execute: async ({ sock, m, args }) => {
    if (args.length === 0) {
      return sock.sendMessage(m.key.remoteJid, { text: '¿Qué canción quieres escuchar? 🎶' }, { quoted: m })
    }

    const text = args.join(' ')

    try {
      const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      let videoUrl = text
      let title = 'Música'

      if (!isUrl) {
        const search = await yts(text)
        const video = search.videos[0]
        if (!video) {
          return sock.sendMessage(m.key.remoteJid, { text: 'No encontré resultados 😿' }, { quoted: m })
        }
        videoUrl = video.url
        title = video.title
      }

      await sock.sendMessage(m.key.remoteJid, { text: `⏳ Procesando: *${title}*...` }, { quoted: m })

      const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' })
      const chunks = []
      
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      const buffer = Buffer.concat(chunks)

      await sock.sendMessage(
        m.key.remoteJid,
        {
          audio: buffer,
          mimetype: 'audio/mp4',
          fileName: `${title}.mp3`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      sock.sendMessage(m.key.remoteJid, { text: 'Ocurrió un error al descargar ❌' }, { quoted: m })
    }
  }
}
