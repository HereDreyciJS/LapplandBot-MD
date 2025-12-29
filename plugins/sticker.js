import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Sticker } from 'wa-sticker-formatter'

export default {
  command: ['s', 'sticker', 'stiker'],
  description: 'Crea stickers localmente',
  execute: async ({ sock, m, pushName }) => {
        const base64 = buffer.toString('base64')
      const response = await fetch('https://api.lolhuman.xyz/api/stickerwp?apikey=GataDios', {
        method: 'POST',
        body: buffer
      })

      if (!response.ok) throw new Error('Error en la API')

      const stiker = await response.buffer()

     
      await sock.sendMessage(m.key.remoteJid, { 
        sticker: stiker 
      }, { quoted: m })

    } catch (e) {
      console.error('Error en Sticker:', e)
      await sock.sendMessage(m.key.remoteJid, { text: '❌ No se pudo crear el sticker. Intenta con una imagen más pequeña.' }, { quoted: m })
    }
  }
}
