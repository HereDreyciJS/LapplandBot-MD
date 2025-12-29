import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { writeFile, readFile, rm } from 'fs/promises'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

ffmpeg.setFfmpegPath(ffmpegPath)

const actionPhrases = {
  hug: 'abrazó a',
  kiss: 'besó a',
  pat: 'acarició a',
  slap: 'le dio una cachetada a'
}

async function gifToMp4(gifBuffer) {
  const id = crypto.randomBytes(8).toString('hex')
  const inPath = path.join(os.tmpdir(), `waifu_${id}.gif`)
  const outPath = path.join(os.tmpdir(), `waifu_${id}.mp4`)

  await writeFile(inPath, gifBuffer)

  await new Promise((resolve, reject) => {
    ffmpeg(inPath)
      .outputOptions([
        '-movflags faststart',
        '-pix_fmt yuv420p',
        '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15'
      ])
      .noAudio()
      .save(outPath)
      .on('end', resolve)
      .on('error', reject)
  })

  const mp4Buffer = await readFile(outPath)
  await rm(inPath).catch(() => {})
  await rm(outPath).catch(() => {})
  return mp4Buffer
}

export default {
  command: ['hug', 'kiss', 'pat', 'slap'],
  description: 'Reacciones anime con GIFs',
  execute: async ({ sock, m, command }) => {
    try {
      const res = await fetch(`https://api.waifu.pics/sfw/${command}`)
      const json = await res.json()
      if (!json?.url) return

      const gifRes = await fetch(json.url)
      const gifBuffer = Buffer.from(await gifRes.arrayBuffer())
      const mp4Buffer = await gifToMp4(gifBuffer)

      const sender = m.key.participant || m.key.remoteJid
      const ctx = m.message?.extendedTextMessage?.contextInfo
      const mentioned = ctx?.mentionedJid?.[0]
      const quoted = ctx?.participant
      const target = mentioned || quoted

      const phrase = actionPhrases[command] || 'interactuó con'
      const caption = target
        ? `@${sender.split('@')[0]} ${phrase} @${target.split('@')[0]}`
        : `@${sender.split('@')[0]} se ${phrase.split(' ')[0]} a sí mismo`

      await sock.sendMessage(
        m.key.remoteJid,
        {
          video: mp4Buffer,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption,
          mentions: [sender, target].filter(Boolean)
        },
        { quoted: m }
      )
    } catch (e) {
      console.error('Error en el plugin:', e)
    }
  }
}
