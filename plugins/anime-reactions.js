import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { writeFile, readFile, rm } from 'fs/promises'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

ffmpeg.setFfmpegPath(ffmpegPath)

const actions = {
  hug: 'abrazó a',
  kiss: 'besó a',
  pat: 'acarició a',
  slap: 'le dio una cachetada a'
}

async function gifToMp4(buffer) {
  const id = crypto.randomBytes(6).toString('hex')
  const gifPath = path.join(os.tmpdir(), `${id}.gif`)
  const mp4Path = path.join(os.tmpdir(), `${id}.mp4`)
  await writeFile(gifPath, buffer)
  await new Promise((res, rej) => {
    ffmpeg(gifPath)
      .outputOptions([
        '-movflags faststart',
        '-pix_fmt yuv420p',
        '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15'
      ])
      .noAudio()
      .save(mp4Path)
      .on('end', res)
      .on('error', rej)
  })
  const out = await readFile(mp4Path)
  await rm(gifPath).catch(() => {})
  await rm(mp4Path).catch(() => {})
  return out
}

function getQuotedJid(m) {
  return (
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.key?.participant ||
    m.message?.imageMessage?.contextInfo?.participant ||
    m.message?.imageMessage?.contextInfo?.quotedMessage?.key?.participant ||
    m.message?.videoMessage?.contextInfo?.participant ||
    m.message?.videoMessage?.contextInfo?.quotedMessage?.key?.participant ||
    m.message?.stickerMessage?.contextInfo?.participant ||
    m.message?.stickerMessage?.contextInfo?.quotedMessage?.key?.participant ||
    null
  )
}

export default {
  command: Object.keys(actions),
  execute: async ({ sock, m, command }) => {
    try {
      const res = await fetch(`https://api.waifu.pics/sfw/${command}`)
      const { url } = await res.json()
      if (!url) return
      const gifRes = await fetch(url)
      const gifBuffer = Buffer.from(await gifRes.arrayBuffer())
      const mp4Buffer = await gifToMp4(gifBuffer)
      const senderJid = m.key.participant || m.key.remoteJid
      const targetJid = getQuotedJid(m)
      let senderName = senderJid.split('@')[0]
      let targetName = null
      if (m.isGroup) {
        const meta = await sock.groupMetadata(m.key.remoteJid)
        senderName = meta.participants.find(p => p.id === senderJid)?.notify || senderName
        if (targetJid && targetJid !== senderJid) {
          targetName = meta.participants.find(p => p.id === targetJid)?.notify || targetJid.split('@')[0]
        }
      }
      const caption = targetName
        ? `*${senderName}* ${actions[command]} *${targetName}*`
        : `*${senderName}* se ${actions[command].split(' ')[0]} a sí mismo/a`
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
