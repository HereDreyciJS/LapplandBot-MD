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

      const res = await fetch(`https://api.zenkey.my.id/api/download/ytmp3?url=${video.url}`)
      const json = await res.json()
      
      if (!json.status) throw new Error('API Error')

      await sock.sendMessage(
        m.key.remoteJid,
        {
          audio: { url: json.result.download_url },
          mimetype: 'audio/mp4',
          fileName: `${video.title}.mp3`
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
      sock.sendMessage(m.key.remoteJid, { text: 'Error de conexión con YouTube (IP Bloqueada). Intenta de nuevo.' }, { quoted: m })
    }
  }
}
