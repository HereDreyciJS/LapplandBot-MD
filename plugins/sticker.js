import fetch from 'node-fetch'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Sticker via API robusta',
  execute: async ({ sock, m, pushName }) => {
    try {
      let quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      let msg = quoted ? quoted : m.message
      let mimeType = Object.keys(msg).find(v => v.includes('Message'))

      if (!/image|video/.test(mimeType)) return sock.sendMessage(m.key.remoteJid, { text: 'Responde a una imagen o video corto.' }, { quoted: m })

      // Descarga manual del buffer
      const stream = await downloadContentFromMessage(msg[mimeType], mimeType.replace('Message', '').toLowerCase())
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      // Usamos una API alternativa (Aitana) que suele saltarse bloqueos de Panel
      const res = await fetch(`https://api.boxmine.xyz/api/maker/sticker?author=${pushName}&pack=LapplandBot`, {
        method: 'POST',
        body: buffer
      })

      const stikerBuffer = await res.buffer()
      
      if (stikerBuffer) {
        await sock.sendMessage(m.key.remoteJid, { sticker: stikerBuffer }, { quoted: m })
      }

    } catch (e) {
      console.error(e)
      await sock.sendMessage(m.key.remoteJid, { text: '❌ Error de conexión. El Panel bloqueó la subida.' }, { quoted: m })
    }
  }
}
