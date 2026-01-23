import characters from '../lib/gacha/characters.js'

const rollLocks = new Map()

export default {
  command: ['rw', 'rollwaifu'],
  description: 'Roll y reclama waifus',
  execute: async ({ sock, m, args, prefix }) => {
    try {
      const chatId = m.key.remoteJid
      const userId = m.key.participant || m.key.remoteJid

      if (rollLocks.has(userId)) return
      rollLocks.set(userId, Date.now())
      setTimeout(() => rollLocks.delete(userId), 15000)

      const chat = global.db.getChat(chatId)
      chat.characters ||= {}
      chat.rolls ||= {}

      const allChars = Object.entries(characters)
      if (allChars.length === 0) return sock.sendMessage(chatId, { text: 'No hay personajes disponibles.' }, { quoted: m.key.id ? m : undefined })

      const [charKey, char] = allChars[Math.floor(Math.random() * allChars.length)]

      const now = Date.now()
      chat.rolls[charKey] = {
        charKey,
        reservedBy: userId,
        expiresAt: now + 60000 
      }

      const status = chat.characters[charKey]?.owner ? `Reclamado por ${chat.characters[charKey].ownerName}` : 'Libre'

      const text = `❀ Nombre » *${char.name}*
⚥ Género » *${char.gender}*
❖ Serie » *${char.series || 'Desconocido'}*
✰ Valor » *${char.value || 100}*
♡ Estado » *${status}*`

      await sock.sendMessage(chatId, {
        text
      }, { quoted: m.key.id ? m : undefined })

    } catch (e) {
      console.error('❌ Error en /rw:', e)
    }
  }
}
