import characters from '../lib/gacha/characters.js'
import { getDanbooruImage } from '../lib/danbooru.js'

export default {
  command: ['rw'],
  execute: async ({ sock, m }) => {
    const chatId = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    global.db.data.claims ??= {}
    global.db.data.claims[chatId] ??= {}

    const list = Object.values(characters)
    if (!list.length) {
      return sock.sendMessage(chatId, { text: '❌ No hay personajes disponibles' }, { quoted: m })
    }

    const char = list[Math.floor(Math.random() * list.length)]
    const claimedBy = global.db.data.claims[chatId][char.key]
    const status = claimedBy ? 'Reclamada' : 'Libre'
    const imageUrl = await getDanbooruImage(char.tags)

    const caption = `❀ Nombre » *${char.name}*
⚥ Género » *${char.gender}*
❖ Serie » *${char.series || 'Desconocido'}*
✰ Valor » *${char.value || 100}*
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
}
