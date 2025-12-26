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
      if (!video) return sock.sendMessage(m.key.remoteJid, { text: 'No encontré resultados 😿' }, { quoted: m })

      await sock.sendMessage(m.key.remoteJid, { text: `⏳ Procesando: *${video.title}*...` }, { quoted: m })

      const apiUrl = `https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(video.url)}`
      const api = await fetch(apiUrl)
      const res = await api.json()

      if (res.status === 200 && res.data?.[0]?.url) {
        return await sock.sendMessage(m.key.remoteJid, {
          audio: { url: res.data[0].url },
          mimetype: 'audio/mp4',
          fileName: `${video.title}.mp3`
        }, { quoted: m })
      }

      const backupApi = await fetch(`https://api.boxi.my.id/api/ytmp3?url=${video.url}`)
      const backupRes = await backupApi.json()
      
      if (backupRes.status && backupRes.url) {
        return await sock.sendMessage(m.key.remoteJid, {
          audio: { url: backupRes.url },
          mimetype: 'audio/mp4',
          fileName: `${video.title}.mp3`
        }, { quoted: m })
      }

      return sock.sendMessage(m.key.remoteJid, { text: 'Las APIs están saturadas en este momento ❌' }, { quoted: m })

    } catch (e) {
      console.error(e)
      sock.sendMessage(m.key.remoteJid, { text: 'Ocurrió un error inesperado ❌' }, { quoted: m })
    }
  }
}
