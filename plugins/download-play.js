import fetch from 'node-fetch'
import yts from 'yt-search'

export default {
  command: ['play'],
  description: 'Descarga música',
  execute: async ({ sock, m, args }) => {
    if (args.length === 0) return sock.sendMessage(m.key.remoteJid, { text: '☁️ *Lappland:* ¿Qué melodía quieres que busque en esta noche? 🎶' }, { quoted: m })

    const text = args.join(' ')
    try {
      const search = await yts(text)
      const video = search.videos[0]
      if (!video) return sock.sendMessage(m.key.remoteJid, { text: '🌑 *Lappland:* No encontré esa canción entre las nubes...' }, { quoted: m })

      const infoText = `
☁️ ────────────── 🌑
     *LAPPLAND • MUSIC*
───────────────
🌙 *TÍTULO:* ${video.title}
⏳ *TIEMPO:* ${video.timestamp}
👁️ *VISTAS:* ${video.views.toLocaleString()}
🌑 *ESTADO:* Enviando la melodía...
───────────────`.trim()

      await sock.sendMessage(m.key.remoteJid, { 
        image: { url: video.thumbnail }, 
        caption: infoText 
      }, { quoted: m })

      let downloadUrl = null

      try {
        const resSiput = await fetch(`${global.APIs.siputzx.url}/api/dwnld/ytmp3?url=${video.url}`)
        const jsonSiput = await resSiput.json()
        if (jsonSiput.status && jsonSiput.data?.dl) {
          downloadUrl = jsonSiput.data.dl
        }
      } catch (e) {}

      if (!downloadUrl) {
        try {
          const resDel = await fetch(`${global.APIs.delirius.url}/download/ytmp3?url=${video.url}`)
          const jsonDel = await resDel.json()
          if (jsonDel.status && jsonDel.data?.download?.url) {
            downloadUrl = jsonDel.data.download.url
          }
        } catch (e) {}
      }

      if (!downloadUrl) {
        try {
          const resVreden = await fetch(`${global.APIs.vreden.url}/api/ytmp3?url=${video.url}`)
          const jsonVreden = await resVreden.json()
          if (jsonVreden.status && jsonVreden.result?.download?.url) {
            downloadUrl = jsonVreden.result.download.url
          }
        } catch (e) {}
      }

      if (!downloadUrl) {
        return sock.sendMessage(m.key.remoteJid, { text: '☁️ *Lappland:* Todas mis fuentes se han desvanecido. Intenta más tarde.' }, { quoted: m })
      }

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
      sock.sendMessage(m.key.remoteJid, { text: '☁️ *Lappland:* Hubo un error en la oscuridad... ❌' }, { quoted: m })
    }
  }
}
