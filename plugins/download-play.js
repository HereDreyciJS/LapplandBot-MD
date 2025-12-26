import fetch from 'node-fetch'
import yts from 'yt-search'
import ytdl from '@distube/ytdl-core'

export default {
  command: ['play'],
  description: 'Descarga música de YouTube',
  execute: async ({ sock, m, args }) => {
    if (args.length === 0) return sock.sendMessage(m.key.remoteJid, { text: '¿Qué canción quieres? 🎶' }, { quoted: m })

    const text = args.join(' ')
    try {
      const search = await yts(text)
      const video = search.videos[0]
      if (!video) return sock.sendMessage(m.key.remoteJid, { text: 'No encontré resultados 😿' }, { quoted: m })

      await sock.sendMessage(m.key.remoteJid, { text: `⏳ Procesando: *${video.title}*...` }, { quoted: m })

      const stream = ytdl(video.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
          }
        }
      })

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
          fileName: `${video.title}.mp3`
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
      // Intento final con una API de emergencia si el buffer falla
      try {
        const api = await fetch(`https://api.tostadora.org/api/ytdl/mp3?url=${encodeURIComponent(text)}`)
        const res = await api.json()
        if (res.url) {
          return await sock.sendMessage(m.key.remoteJid, { audio: { url: res.url }, mimetype: 'audio/mp4' }, { quoted: m })
        }
      } catch (e2) {}
      
      sock.sendMessage(m.key.remoteJid, { text: 'Error al procesar el audio. YouTube está bloqueando la conexión del servidor ❌' }, { quoted: m })
    }
  }
}
