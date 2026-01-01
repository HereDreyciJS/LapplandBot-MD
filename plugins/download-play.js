import fetch from 'node-fetch'
import yts from 'yt-search'

export default {
  command: ['play','yta','ytmp3','playaudio','play2','ytmp4','mp4'],
  category: 'descargas',
  group: true,
description: 'Descarga audios y videos de YouTube',
  execute: async ({ sock, m, text, command }) => {
    try {
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
      const query = match ? `https://youtu.be/${match[1]}` : text

      const search = await yts(query)
      const video = match
        ? search.videos.find(v => v.videoId === match[1]) || search.videos[0]
        : search.videos[0]

      if (!video) throw 'ꕥ No se encontraron resultados.'

      const { title, thumbnail, timestamp, views, ago, url, author, seconds } = video
      if (seconds > 1800) throw '⚠ El contenido supera los 30 minutos.'

      const info =
`「✦」Descargando *<${title}>*

> ❑ Canal » *${author.name}*
> ♡ Vistas » *${formatViews(views)}*
> ✧︎ Duración » *${timestamp}*
> ☁︎ Publicado » *${ago}*
> ➪ Link » ${url}`

      await sock.sendMessage(
        m.key.remoteJid,
        { image: { url: thumbnail }, caption: info },
        { quoted: m }
      )

      // AUDIO
      if (['play','yta','ytmp3','playaudio'].includes(command)) {
        const audio = await getAud(url)
        if (!audio?.url) throw '⚠ No se pudo obtener el audio.'

        await sock.sendMessage(
          m.key.remoteJid,
          { text: `> ❀ Audio listo\n> Servidor » ${audio.api}` },
          { quoted: m }
        )

        await sock.sendMessage(
          m.key.remoteJid,
          { audio: { url: audio.url }, fileName: `${title}.mp3`, mimetype: 'audio/mpeg' },
          { quoted: m }
        )
      }
      // VIDEO
      else {
        const videoDl = await getVid(url)
        if (!videoDl?.url) throw '⚠ No se pudo obtener el video.'

        await sock.sendMessage(
          m.key.remoteJid,
          { text: `> ❀ Video listo\n> Servidor » ${videoDl.api}` },
          { quoted: m }
        )

        await sock.sendMessage(
          m.key.remoteJid,
          { video: { url: videoDl.url }, caption: `> ❀ ${title}` },
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

// ===== helpers =====
async function getAud(url) {
  const apis = [
    { api:'Adonix', endpoint:`${global.APIs.adonix.url}/download/ytaudio?apikey=${global.APIs.adonix.key}&url=${encodeURIComponent(url)}`, extractor:r=>r.data?.url },
    { api:'Zenzxz', endpoint:`${global.APIs.zenzxz.url}/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor:r=>r.data?.download_url },
    { api:'Yupra',  endpoint:`${global.APIs.yupra.url}/api/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor:r=>r.result?.link },
    { api:'Vreden', endpoint:`${global.APIs.vreden.url}/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}&quality=128`, extractor:r=>r.result?.download?.url }
  ]
  return fetchFromApis(apis)
}

async function getVid(url) {
  const apis = [
    { api:'Adonix', endpoint:`${global.APIs.adonix.url}/download/ytvideo?apikey=${global.APIs.adonix.key}&url=${encodeURIComponent(url)}`, extractor:r=>r.data?.url },
    { api:'Zenzxz', endpoint:`${global.APIs.zenzxz.url}/downloader/ytmp4?url=${encodeURIComponent(url)}&resolution=360`, extractor:r=>r.data?.download_url },
    { api:'Vreden', endpoint:`${global.APIs.vreden.url}/api/v1/download/youtube/video?url=${encodeURIComponent(url)}&quality=360`, extractor:r=>r.result?.download?.url }
  ]
  return fetchFromApis(apis)
}

async function fetchFromApis(apis) {
  for (const { api, endpoint, extractor } of apis) {
    try {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(endpoint, { signal: controller.signal }).then(r=>r.json())
      clearTimeout(t)
      const link = extractor(res)
      if (link) return { url: link, api }
    } catch {}
    await new Promise(r=>setTimeout(r, 500))
  }
  return null
}

function formatViews(v) {
  if (!v) return 'No disponible'
  if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v/1e3).toFixed(1)}k`
  return v.toString()
}
