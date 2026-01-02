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

function getContextInfo(msg) {
  return (
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    msg.message?.stickerMessage?.contextInfo ||
    null
  )
}

async function gifToMp4(gifBuffer) {
  const id = crypto.randomBytes(8).toString('hex')
  const inPath = path.join(os.tmpdir(), `${id}.gif`)
  const outPath = path.join(os.tmpdir(), `${id}.mp4`)

  await writeFile(inPath, gifBuffer)

  await new Promise((res, rej) => {
    ffmpeg(inPath)
      .outputOptions([
        '-movflags faststart',
        '-pix_fmt yuv420p',
        '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15'
      ])
      .noAudio()
      .save(outPath)
      .on('end', res)
      .on('error', rej)
  })

  const mp4 = await readFile(outPath)
  await rm(inPath).catch(() => {})
  await rm(outPath).catch(() => {})
  return mp4
}

export default {
  command: Object.keys(actionPhrases),
  execute: async ({ sock, m, command }) => {
    try {
      const res = await fetch(`https://api.waifu.pics/sfw/${command}`)
      const json = await res.json()
      if (!json?.url) return

      const gif = await fetch(json.url)
      const gifBuffer = Buffer.from(await gif.arrayBuffer())
      const mp4 = await gifToMp4(gifBuffer)

      const senderJid = m.key.participant || m.key.remoteJid
      const ctx = getContextInfo(m)

      const targetJid =
        ctx?.participant ||
        ctx?.mentionedJid?.[0] ||
        null

      let senderName = 'Alguien'
      let targetName = null

      if (m.isGroup) {
        const meta = await sock.groupMetadata(m.key.remoteJid)

        senderName =
          meta.participants.find(p => p.id === senderJid)?.notify ||
          senderJid.split('@')[0]

        if (targetJid && targetJid !== senderJid) {
          targetName =
            meta.participants.find(p => p.id === targetJid)?.notify ||
            targetJid.split('@')[0]
        }
      }

      const caption = targetName
        ? `*${senderName}* ${actionPhrases[command]} *${targetName}*`
        : `*${senderName}* se ${actionPhrases[command].split(' ')[0]} a sí mismo/a`

      await sock.sendMessage(
        m.key.remoteJid,
        {
          video: mp4,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
    }
  }
}
