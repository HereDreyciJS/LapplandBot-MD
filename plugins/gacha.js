import pool from '../lib/gacha/pool.js'
import { getImage } from '../lib/gacha/image.js'

export default {
  command: ['gacha'],
  category: 'fun',
  async execute({ sock, m }) {
    const chatId = m.key.remoteJid
    const userId = m.key.participant || chatId
    const user = global.db.getUser(userId)

    const now = Date.now()
    if (user.lastGacha && now - user.lastGacha < 60000) return

    const pick = pool[Math.floor(Math.random() * pool.length)]
    const img = await getImage(pick.tag)

    if (!img) return

    await sock.sendMessage(
      chatId,
      {
        image: { url: img },
        caption:
`🎴 Gacha
Nombre: ${pick.name}
Valor: ${pick.value}`
      },
      { quoted: m }
    )

    user.lastGacha = now
  }
}
