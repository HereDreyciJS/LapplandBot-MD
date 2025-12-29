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
    p.on('error', reject)
    p.on('close', c => c === 0 ? resolve() : reject(new Error(`ffmpeg ${c}`)))
  })
}

export default {
  command: ['s','sticker','stiker'],
  execute: async ({ sock, m }) => {
    try {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const message = normalizeMessageContent(quoted ?? m.message)
      const type = getContentType(message)
      if (!['imageMessage','videoMessage'].includes(type)) return

      const stream = await downloadContentFromMessage(
        message[type],
        type === 'imageMessage' ? 'image' : 'video'
      )

      let buffer = Buffer.alloc(0)
      for await (const c of stream) buffer = Buffer.concat([buffer, c])

      const input = path.join(tmpdir(), `${Date.now()}.${type === 'imageMessage' ? 'jpg' : 'mp4'}`)
      const output = path.join(tmpdir(), `${Date.now()}.webp`)
      fs.writeFileSync(input, buffer)

      if (type === 'imageMessage') {
        await sharp(input)
          .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(output)
      } else {
        await runFfmpeg([
          '-y',
          '-i', input,
          '-vf',
          // 1) quitar barras negras
          'crop=iw:ih-((ih-iw*9/16)*2):0:(ih-iw*9/16),' +
          // 2) escalar sin deformar
          'scale=512:512:force_original_aspect_ratio=decrease,' +
          // 3) pad transparente real
          'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,' +
          'fps=15',
          '-vcodec', 'libwebp',
          '-pix_fmt', 'yuva420p',
          '-loop', '0',
          '-t', '6',
          '-an',
          output
        ])
      }

      await sock.sendMessage(
        m.key.remoteJid,
        { sticker: fs.readFileSync(output) },
        { quoted: m }
      )

      fs.unlinkSync(input)
      fs.unlinkSync(output)
    } catch (e) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `❌ Error al crear el sticker: ${e.message}` },
        { quoted: m }
      )
    }
  }
}
