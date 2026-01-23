import characters from '../lib/gacha/characters.js'
import { getDanbooruImage } from '../lib/danbooru.js'

export default {
  command: ['rw', 'claim', 'harem'],
  execute: async ({ sock, m, command }) => {
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    global.db.data.claims ??= {}
    global.db.data.harem ??= {}

    if (command === 'rw') {
      const list = Object.values(characters)
      if (!list.length) {
        return sock.sendMessage(chatId, { text: '❌ No hay personajes disponibles' }, { quoted: m })
      }

      const char = list[Math.floor(Math.random() * list.length)]
      const claimedBy = global.db.data.claims[char.key]
      const status = claimedBy ? 'Reclamada' : 'Libre'
      const imageUrl = await getDanbooruImage(char.tags)

      const caption = `❀ Nombre » *${char.name}*
⚥ Género » *${char.gender}*
❖ Serie » *${char.series}*
✰ Valor » *${char.value}*
♡ Estado » *${status}*`

      if (imageUrl) {
        await sock.sendMessage(chatId, {
          image: { url: imageUrl },
          caption
        }, { quoted: m })
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: m })
      }
    }

    if (command === 'claim') {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const text = quoted?.imageMessage?.caption || quoted?.conversation
      if (!text) {
        return sock.sendMessage(chatId, { text: '❌ Responde a un /rw para reclamar' }, { quoted: m })
      }

      const match = text.match(/Nombre » \*(.+?)\*/)
      if (!match) {
        return sock.sendMessage(chatId, { text: '❌ No se pudo identificar el personaje' }, { quoted: m })
      }

      const char = Object.values(characters).find(c => c.name === match[1])
      if (!char) return

      if (global.db.data.claims[char.key]) {
        return sock.sendMessage(chatId, { text: '❌ Ya fue reclamada' }, { quoted: m })
      }

      global.db.data.claims[char.key] = sender
      global.db.data.harem[sender] ??= []
      global.db.data.harem[sender].push(char)

      await sock.sendMessage(chatId, {
        text: `💖 *${char.name}* ahora es tuya`
      }, { quoted: m })
    }

    if (command === 'harem') {
      const list = global.db.data.harem[sender]
      if (!list || !list.length) {
        return sock.sendMessage(chatId, { text: '❌ No tienes waifus aún' }, { quoted: m })
      }

      const text = list.map((c, i) =>
        `${i + 1}. ${c.name} (${c.series})`
      ).join('\n')

      await sock.sendMessage(chatId, {
        text: `💘 *Tu Harem*\n\n${text}`
      }, { quoted: m })
    }
  }
}
