import fetch from 'node-fetch'
import yts from 'yt-search'

export default {
  command: ['play'],
  description: 'Descarga música con estética de medianoche y nubes',
  execute: async ({ sock, m, args }) => {
    if (args.length === 0) return sock.sendMessage(m.key.remoteJid, { text: '☁️ *Lappland:* ¿Qué melodía quieres que busque en esta noche? 🎶' }, { quoted: m })

    const text = args.join(' ')
    try {
      const search = await yts(text)
      const video = search.videos[0]
      if (!video) return sock.sendMessage(m.key.remoteJid, { text: '🌑 *Lappland:* No encontré esa canción entre las nubes...' }, { quoted: m })

      // Decoración temática Nubes / Midnight
      const infoText = `
☁️ ────────────── 🌑
     *LAPPLAND • MUSIC*
───────────────
🌙 *TÍTULO:* ${video.title}
⏳ *TIEMPO:* ${video.timestamp}
🌑 *ESTADO:* Enviando nota de voz...
───────────────`.trim()

      await sock.sendMessage(m.key.remoteJid, { 
        image: { url: video.thumbnail }, 
        caption: infoText 
      }, { quoted: m })

      let downloadUrl = null

      // Intento 1: GawrGura API
      try {
        const resGura = await fetch(`https://gawrgura-api.onrender.com/api/download/ytmp3?url=${video.url}`)
        const jsonGura = await resGura.json()
        if (jsonGura.status && jsonGura.result?.download?.url) {
          downloadUrl = jsonGura.result.download.url
        }
      } catch (e) {}

      // Intento 2: Dark-Core API
      if (!downloadUrl) {
        try {
          const resDark = await fetch(`https://dark-core-api.vercel.app/api/download/ytmp3/v2?key=api&url=${video.url}`)
          const jsonDark = await resDark.json()
          if (jsonDark.status && jsonDark.result?.download?.url) {
            downloadUrl = jsonDark.result.download.url
          }
        } catch (e) {}
      }

      if (!downloadUrl) {
        return sock.sendMessage(m.key.remoteJid, { text: '☁️ *Lappland:* La descarga se perdió en la tormenta. Intenta luego.' }, { quoted: m })
      }

      // Envío directo como Nota de Voz (PTT)
      await sock.sendMessage(
        m.key.remoteJid,
        {
          audio: { url: downloadUrl },
          mimetype: 'audio/mp4',
          ptt: true
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      sock.sendMessage(m.key.remoteJid, { text: '☁️ *Lappland:* Hubo un error inesperado... ❌' }, { quoted: m })
    }
  }
}
