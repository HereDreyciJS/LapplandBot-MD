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
  sleep: 'se quedó dormido/a junto a',
  blush: 'se sonrojó frente a',
  smile: 'le sonrió a',
  wave: 'le saludó a',
  cry: 'le lloró a',
  dance: 'bailó con'
}

async function gifToMp4(buffer) {
  const id = crypto.randomBytes(8).toString('hex')
  const inPath = path.join(os.tmpdir(), `${id}.gif`)
  const outPath = path.join(os.tmpdir(), `${id}.mp4`)
  await writeFile(inPath, buffer)
  await new Promise((resolve, reject) => {
    ffmpeg(inPath)
      .outputOptions(['-movflags faststart', '-pix_fmt yuv420p', '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15'])
      .noAudio().save(outPath).on('end', resolve).on('error', reject)
  })
  const mp4Buffer = await readFile(outPath)
  await rm(inPath).catch(() => {})
  await rm(outPath).catch(() => {})
  return mp4Buffer
}

export default {
  command: Object.keys(actionPhrases),
  execute: async ({ sock, m, command, pushName }) => {
    try {
      const res = await fetch(`https://api.waifu.pics/sfw/${command}`)
      const json = await res.json()
      if (!json?.url) return

      const gifRes = await fetch(json.url)
      const gifBuffer = Buffer.from(await gifRes.arrayBuffer())
      const mp4Buffer = await gifToMp4(gifBuffer)

      const senderJid = m.key.participant || m.key.remoteJid
      const senderName = pushName || 'Alguien'
      const isGroup = m.isGroup

      let targetJid = null
      let targetName = null

      if (isGroup && m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        targetJid = m.message.extendedTextMessage.contextInfo.participant
        const meta = await sock.groupMetadata(m.key.remoteJid)
        const participant = meta.participants.find(p => p.id === targetJid)
        targetName = participant?.notify || participant?.verifiedName || targetJid.split('@')[0]
      }

      if (!targetJid && m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
        const meta = isGroup ? await sock.groupMetadata(m.key.remoteJid) : null
        const participant = meta?.participants.find(p => p.id === targetJid)
        targetName = participant?.notify || participant?.verifiedName || targetJid.split('@')[0]
      }

      let caption = ''
      if (targetJid && targetJid !== senderJid) {
        caption = `*${senderName}* ${actionPhrases[command]} *${targetName}*`
      } else {
        switch (command) {
          case 'sleep':
            caption = `*${senderName}* se quedó dormido/a plácidamente.`
            break
          case 'punch':
            caption = `*${senderName}* practicó sus puñetazos al aire.`
            break
          default:
            caption = `*${senderName}* se hizo la acción a sí mismo/a.`
            break
        }
      }

      await sock.sendMessage(
        m.key.remoteJid,
        {
          video: mp4Buffer,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption,
          mentions: [senderJid, targetJid].filter(Boolean)
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
    }
  }
}
