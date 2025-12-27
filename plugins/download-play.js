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

      await sock.sendMessage(m.key.remoteJid, { text: `⏳ Descargando: *${video.title}*...` }, { quoted: m })

      // Usando una API de descarga directa que no depende de tu IP
      const apiUrl = `https://api.lolhuman.xyz/api/ytaudio2?apikey=GataDios&url=${video.url}`
      const res = await fetch(apiUrl)
      const json = await res.json()

      if (json.status !== 200) {
        // Segundo intento con API de respaldo
        const res2 = await fetch(`https://api.cafirexos.com/api/ytmp3?url=${video.url}`)
        const json2 = await res2.json()
        
        if (!json2.status || !json2.result?.url) {
          throw new Error('Todas las APIs fallaron')
        }

        return await sock.sendMessage(m.key.remoteJid, {
          audio: { url: json2.result.url },
          mimetype: 'audio/mp4',
          fileName: `${video.title}.mp3`
        }, { quoted: m })
      }

      await sock.sendMessage(
        m.key.remoteJid,
        {
          audio: { url: json.result.link },
          mimetype: 'audio/mp4',
          fileName: `${video.title}.mp3`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      sock.sendMessage(m.key.remoteJid, { text: 'Las APIs de YouTube están saturadas. Intenta más tarde ❌' }, { quoted: m })
    }
  }
}
