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
  kill: 'mató a',
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
      .outputOptions(['-movflags faststart', '-pix_fmt yuv420p', '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15'])
      .noAudio().save(outPath).on('end', resolve).on('error', reject)
  })
  const mp4Buffer = await readFile(outPath)
  await rm(inPath).catch(() => {})
  await rm(outPath).catch(() => {})
  return mp4Buffer
}

const selfPhrases = {
  hug: 'abraza su almohada fuertemente',
  kiss: 'practica a darse besitos con el espejo',
  pat: 'se acarició a sí mismo/a',
  slap: 'se dio una cachetada a sí mismo/a',
  kill: 'se suicidó',
  punch: 'practicó sus puñetazos al aire',
  cuddle: 'se acurrucó solo/a',
  bite: 'se mordió a sí mismo/a',
  lick: 'se lamió a sí mismo/a',
  highfive: 'chocó los cinco consigo mismo/a',
  poke: 'se da un toquecitos a sí mismo/a',
  sleep: 'se acomodó y se quedó dormido/a plácidamente',
  blush: 'se sonrojó',
  smile: 'sonríe alegremente',
  wave: 'saluda a todos',
  cry: 'llora desconsoladamente',
  dance: 'da pasos de baile'
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

      const sender = m.key.participant || m.key.remoteJid
      const senderName = pushName || 'Alguien'

      const ctx = m.message?.extendedTextMessage?.contextInfo
      let targetJid = null

      if (ctx?.mentionedJid?.length) targetJid = ctx.mentionedJid[0]
      else if (ctx?.quotedMessage) targetJid = ctx.participant

      let caption = ''
      const mentionsArray = [sender]

      if (targetJid && targetJid !== sender) {
        caption = `*${senderName}* ${actionPhrases[command]} @${targetJid.split('@')[0]}`
        mentionsArray.push(targetJid)
      } else {
        caption = `*${senderName}* ${selfPhrases[command] || 'realizó la acción a sí mismo/a'}`
      }

      await sock.sendMessage(
        m.key.remoteJid,
        {
          video: mp4Buffer,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption: caption,
          mentions: mentionsArray
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
    }
  }
}
