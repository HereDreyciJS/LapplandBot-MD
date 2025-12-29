import {
  downloadContentFromMessage,
  getContentType,
  normalizeMessageContent
} from '@whiskeysockets/baileys'
import sharp from 'sharp'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers con sharp y ffmpeg',
  execute: async ({ sock, m }) => {
    try {
      const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const raw = q ?? m.message
      const msg = normalizeMessageContent(raw)
      const type = getContentType(msg)

      if (type !== 'imageMessage' && type !== 'videoMessage') {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: 'Responde a una imagen o video corto.' },
          { quoted: m }
        )
      }

      const stream = await downloadContentFromMessage(
        msg[type],
        type === 'imageMessage' ? 'image' : 'video'
      )

      let buffer = Buffer.alloc(0)
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

      const tmp = tmpdir()
      const input = path.join(tmp, `${Date.now()}.${type === 'imageMessage' ? 'jpg' : 'mp4'}`)
      const output = path.join(tmp, `${Date.now()}.webp`)

      fs.writeFileSync(input, buffer)

      if (type === 'imageMessage') {
        await sharp(input)
          .resize(512, 512, { fit: 'inside' })
          .webp({ quality: 80 })
          .toFile(output)
      } else {
        await execAsync(
          `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -t 6 -loop 0 -an -vsync 0 "${output}"`
        )
      }

      const sticker = fs.readFileSync(output)

      await sock.sendMessage(
        m.key.remoteJid,
        { sticker },
        { quoted: m }
      )

      fs.unlinkSync(input)
      fs.unlinkSync(output)

    } catch (e) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Error al crear el sticker' },
        { quoted: m }
      )
    }
  }
}
