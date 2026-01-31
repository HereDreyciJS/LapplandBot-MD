import characters from '../lib/gacha/characters.js'
import { getDanbooruImage } from '../lib/danbooru.js'

export default {
  command: ['rw'],
  execute: async ({ sock, m }) => {
    const chatId = m.key.remoteJid

    global.db.data.claims ??= {}
    global.db.data.claims[chatId] ??= {}

    const list = Object.values(characters)
    if (!list.length) {
      return sock.sendMessage(chatId, { text: '❌ No hay personajes disponibles' }, { quoted: m })
    }

    const char = list[Math.floor(Math.random() * list.length)]
    const claimedBy = global.db.data.claims[chatId][char.key]

    let status = 'Libre'
    if (claimedBy) {
      const user = global.db.data.users?.[claimedBy]
      const name = user?.name || 'Alguien'

      if (char.gender?.toLowerCase() === 'femenino') status = `Reclamada por ${name}`
      else if (char.gender?.toLowerCase() === 'masculino') status = `Reclamado por ${name}`
      else status = `Reclamado/a por ${name}`
    }

    const imageUrl = await getDanbooruImage(char.tags)

    const caption = `❀ Nombre » *${char.name}*
⚥ Género » *${char.gender || 'Desconocido'}*
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
