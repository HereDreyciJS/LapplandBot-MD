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
  slap: 'le dio una cachetada a',
  kill: 'asesinó a',
  punch: 'le dio un puñetazo a',
  cuddle: 'se acurrucó con',
  bite: 'mordió a',
  lick: 'lamió a',
  highfive: 'chocó los cinco con',
  poke: 'le dio un toque a',
  sleep: 'se durmió con',
  blush: 'se sonrojó frente a',
  smile: 'le sonrió a',
  wave: 'le saludó a',
  cry: 'le lloró a',
  dance: 'bailó con'
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
  command: Object.keys(actionPhrases),
  execute: async ({ sock, m, command }) => {
    try {
      const res = await fetch(`https://api.waifu.pics/sfw/${command}`)
      const json = await res.json()
      if (!json?.url) return

      const gifRes = await fetch(json.url)
      const gifBuffer = Buffer.from(await gifRes.arrayBuffer())
      const mp4Buffer = await gifToMp4(gifBuffer)

      const senderJid = m.key.participant || m.key.remoteJid
      const ctx = m.message?.extendedTextMessage?.contextInfo

      // 🔴 FORMA CORRECTA
      const targetJid =
        ctx?.participant ||
        ctx?.mentionedJid?.[0] ||
        null

      let senderName = 'Alguien'
      let targetName = null

      if (m.isGroup) {
        const meta = await sock.groupMetadata(m.key.remoteJid)

        const senderData = meta.participants.find(p => p.id === senderJid)
        senderName = senderData?.notify || senderData?.verifiedName || senderName

        if (targetJid && targetJid !== senderJid) {
          const targetData = meta.participants.find(p => p.id === targetJid)
          targetName = targetData?.notify || targetData?.verifiedName || null
        }
      }

      const caption = targetName
        ? `*${senderName}* ${actionPhrases[command]} *${targetName}*`
        : `*${senderName}* se ${actionPhrases[command].split(' ')[0]} a sí mismo/a`

      await sock.sendMessage(
        m.key.remoteJid,
        {
          video: mp4Buffer,
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
