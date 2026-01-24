import fetch from 'node-fetch'
import yts from 'yt-search'

const key = "dfcb6d76f2f6a9894gjkege8a4ab232222"
const agent = "Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0"
const referer = "https://y2down.cc/enSB/"

export default {
  command: ['play','yta','ytmp3','playaudio','play2','ytmp4','mp4'],
  category: 'descargas',
  group: true,
  description: 'Descarga audios y videos de YouTube',

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

      const match = text.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/
      )

      const query = match ? match[1] : text
      const search = await yts(query)
      const video = match
        ? search.videos.find(v => v.videoId === match[1]) || search.videos[0]
        : search.videos[0]

      if (!video) throw 'ꕥ No se encontraron resultados.'

      const { title, thumbnail, timestamp, views, ago, url, seconds } = video
      if (seconds > 1800) throw '⚠ El contenido supera los 30 minutos.'

      const info = `「✦」Descargando *<${title}>*\n\n> ❑ Canal » *${video.author?.name || 'Desconocido'}*\n> ♡ Vistas » *${formatViews(views)}*\n> ✧︎ Duración » *${timestamp || 'Desconocido'}*\n> ☁︎ Publicado » *${ago || 'Desconocido'}*\n> ➪ Link » ${url}`

      await sock.sendMessage(
        m.key.remoteJid,
        { image: { url: thumbnail }, caption: info },
        { quoted: m }
      )

      const isAudio = ['play','yta','ytmp3','playaudio','play2'].includes(command)
      const format = isAudio ? 'mp3' : '360'

      const result = await ytdl(url, format)
      if (result.error || !result.link) throw '⚠ No se pudo obtener el archivo.'

      if (isAudio) {
        await sock.sendMessage(
          m.key.remoteJid,
          {
            audio: { url: result.link },
            fileName: `${title}.mp3`,
            mimetype: 'audio/mpeg'
          },
          { quoted: m }
        )
      } else {
        await sock.sendMessage(
          m.key.remoteJid,
          {
            video: { url: result.link },
            caption: `> ❀ ${title}`
          },
          { quoted: m }
        )
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

async function ytdl(url, format) {
  try {
    const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${url}&api=${key}`
    const init = await fetch(initUrl, {
      headers: { 'User-Agent': agent, 'Referer': referer }
    })
    const data = await init.json()
    if (!data.success) return { error: true }

    const id = data.id
    const progressUrl = `https://p.savenow.to/api/progress?id=${id}`

    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 2000))
      const res = await fetch(progressUrl, {
        headers: { 'User-Agent': agent, 'Referer': referer }
      })
      const status = await res.json()
      if (status.progress === 1000 && status.download_url) {
        return { link: status.download_url }
      }
    }

    return { error: true }
  } catch {
    return { error: true }
  }
}

function formatViews(v) {
  if (!v) return 'No disponible'
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k`
  return v.toString()
}
