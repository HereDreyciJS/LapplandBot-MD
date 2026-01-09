import {
  downloadContentFromMessage,
  getContentType,
  normalizeMessageContent
} from '@whiskeysockets/baileys'

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
    p.on('close', c => c === 0 ? resolve() : reject(new Error(err)))
  })
}

export default {
  command: ['s', 'sticker'],
  description: 'Crear sticker (imagen / video)',

  execute: async ({ sock, m, args, user }) => {
    try {
      const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage

      const message = normalizeMessageContent(quoted ?? m.message)
      const type = getContentType(message)

      if (!['imageMessage', 'videoMessage'].includes(type)) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ Responde a una imagen o video.' },
          { quoted: m }
        )
      }

      const stream = await downloadContentFromMessage(
        message[type],
        type === 'imageMessage' ? 'image' : 'video'
      )

      let buffer = Buffer.alloc(0)
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

      const input = path.join(tmpdir(), `${Date.now()}.${type === 'imageMessage' ? 'jpg' : 'mp4'}`)
      const output = path.join(tmpdir(), `${Date.now()}.webp`)
      fs.writeFileSync(input, buffer)

      if (type === 'imageMessage') {
        await sharp(input)
          .resize(512, 512, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .webp({ quality: 80 })
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

      const stickerBuffer = fs.readFileSync(output)

      await sock.sendMessage(
        m.key.remoteJid,
        { sticker: stickerBuffer },
        { quoted: m }
      )

      fs.unlinkSync(input)
      fs.unlinkSync(output)

    } catch (e) {
      console.error(e)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Error creando el sticker.' },
        { quoted: m }
      )
    }
  }
}
