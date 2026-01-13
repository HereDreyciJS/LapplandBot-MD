import fetch from 'node-fetch'
import yts from 'yt-search'
import APIs from '../lib/apis.js'
import { localAudio } from '../lib/providers/youtube.js'

export default {
  command: ['play','yta','ytmp3','playaudio','play2','ytmp4','mp4'],
  category: 'descargas',
  group: true,

  execute: async ({ sock, m, text, command, isGroup }) => {
    try {
      if (!isGroup) return

      if (!text?.trim()) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❀ Ingresa el nombre o link del video.' },
          { quoted: m }
        )
      }

      await sock.sendMessage(
        m.key.remoteJid,
        { react: { text: '🕒', key: m.key } }
      )

      const search = await yts(text)
      const video = search.videos[0]
      if (!video) throw 'ꕥ No se encontraron resultados.'

      const { title, thumbnail, timestamp, views, ago, url, seconds } = video
      if (seconds > 1800) throw '⚠ El contenido supera los 30 minutos.'

      await sock.sendMessage(
        m.key.remoteJid,
        {
          image: { url: thumbnail },
          caption:
`「✦」Descargando *<${title}>*

> ♡ Vistas » *${formatViews(views)}*
> ✧︎ Duración » *${timestamp}*
> ☁︎ Publicado » *${ago}*`
        },
        { quoted: m }
      )

      if (['play','yta','ytmp3','playaudio'].includes(command)) {
        let audio = await getAud(url)

        if (audio?.url) {
          await sock.sendMessage(
            m.key.remoteJid,
            {
              audio: { url: audio.url },
              mimetype: 'audio/mpeg',
              fileName: `${title}.mp3`
            },
            { quoted: m }
          )
        } else {
          const buffer = await localAudio(url)

          await sock.sendMessage(
            m.key.remoteJid,
            {
              audio: buffer,
              mimetype: 'audio/mpeg',
              fileName: `${title}.mp3`
            },
            { quoted: m }
          )
        }
      }

      await sock.sendMessage(
        m.key.remoteJid,
        { react: { text: '✔️', key: m.key } }
      )

    } catch (e) {
      await sock.sendMessage(
        m.key.remoteJid,
        { react: { text: '✖️', key: m.key } }
      )
      await sock.sendMessage(
        m.key.remoteJid,
        { text: typeof e === 'string' ? e : '⚠ Error al procesar.' },
        { quoted: m }
      )
    }
  }
}
