import {
  downloadContentFromMessage,
  getContentType,
  normalizeMessageContent
} from '@whiskeysockets/baileys'

import { Sticker } from 'wa-sticker-formatter'
import sharp from 'sharp'
import { spawn } from 'child_process'
import ffmpeg from 'ffmpeg-static'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpeg, args)
    let err = ''
    p.stderr.on('data', d => err += d)
    p.on('error', reject)
    p.on('close', c => c === 0 ? resolve() : reject(new Error(err || `ffmpeg ${c}`)))
  })
}

export default {
  command: ['s', 'sticker', 'stiker', 'wm', 'take'],
  execute: async ({ sock, m, args, pushName }) => {
    try {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const message = normalizeMessageContent(quoted ?? m.message)
      const type = getContentType(message)

      if (!['imageMessage', 'videoMessage', 'stickerMessage'].includes(type)) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ Responde a una imagen, video o sticker.' },
          { quoted: m }
        )
      }

      let pack = 'Lappland Bot'
      let author = pushName || 'User'

      if (args.length > 0) {
        const str = args.join(' ')
        if (str.includes('|')) {
          const [p, a] = str.split('|')
          pack = p.trim()
          author = a.trim()
        } else {
          pack = str.trim()
        }
      }

      const stream = await downloadContentFromMessage(
        message[type],
        type === 'imageMessage' ? 'image' :
        type === 'videoMessage' ? 'video' : 'sticker'
      )

      let buffer = Buffer.alloc(0)
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

      let finalBuffer

      if (type === 'stickerMessage') {
        const sticker = new Sticker(buffer, {
          pack,
          author,
          type: 'default',
          quality: 100
        })
        finalBuffer = await sticker.toBuffer()
      } else {
        const input = path.join(tmpdir(), `${Date.now()}.${type === 'imageMessage' ? 'png' : 'mp4'}`)
        const output = path.join(tmpdir(), `${Date.now()}.webp`)
        fs.writeFileSync(input, buffer)

        if (type === 'imageMessage') {
          await sharp(input)
            .resize(512, 512, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp({ quality: 85 })
            .toFile(output)
        } else {
          await runFfmpeg([
            '-y',
            '-i', input,
            '-vf',
            'scale=512:512:force_original_aspect_ratio=decrease,' +
            'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=15',
            '-vcodec', 'libwebp',
            '-loop', '0',
            '-t', '6',
            '-an',
            output
          ])
        }

        const sticker = new Sticker(fs.readFileSync(output), {
          pack,
          author,
          type: 'default',
          quality: 100
        })
        finalBuffer = await sticker.toBuffer()

        if (fs.existsSync(input)) fs.unlinkSync(input)
        if (fs.existsSync(output)) fs.unlinkSync(output)
      }

      await sock.sendMessage(
        m.key.remoteJid,
        { sticker: finalBuffer },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `❌ Error al crear el sticker.` },
        { quoted: m }
      )
    }
  }
}
