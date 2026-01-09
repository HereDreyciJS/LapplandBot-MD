import { createCanvas, loadImage } from '@napi-rs/canvas'
import print from './utils/print.js'

export const setupWelcome = (sock) => {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      if (!['add', 'remove'].includes(update.action)) return

      const chat = global.db.getChat(update.id)
      if (!chat?.welcome) return

      const users = update.participants
        .map(p => typeof p === 'string' ? p : p?.id || p?.lid)
        .filter(Boolean)

      if (!users.length) return

      const jid = users[0]
      const user = global.db.getUser(jid)

      const displayName = user?.name
        ? user.name
        : `@${jid.split('@')[0]}`

      let background = null
      try {
        const url = await sock.profilePictureUrl(update.id, 'image')
        background = await loadImage(url)
      } catch {}

      let avatar = null
      try {
        const url = await sock.profilePictureUrl(jid, 'image')
        avatar = await loadImage(url)
      } catch {}

      const canvas = createCanvas(720, 720)
      const ctx = canvas.getContext('2d')

      if (background) {
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
      } else {
        ctx.fillStyle = '#1e1e1e'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Avatar circular
      if (avatar) {
        const size = 220
        const x = canvas.width / 2
        const y = canvas.height / 2 - 60
        const r = size / 2

        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        ctx.drawImage(avatar, x - r, y - r, size, size)
        ctx.restore()
      }

      // Nombre del usuario
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.font = 'bold 34px Sans'
      ctx.fillText(displayName, canvas.width / 2, canvas.height / 2 + 120)

      const buffer = canvas.toBuffer('image/png')

      const caption =
        update.action === 'add'
          ? chat.welcomeText || '¡Disfruta de tu estadía!'
          : '¡Que te vaya bien!'

      await sock.sendMessage(update.id, {
        image: buffer,
        caption,
        mentions: user?.name ? [] : [jid]
      })

      await print(
        sock,
        { key: { remoteJid: update.id }, pushName: displayName },
        caption,
        false,
        true,
        update.action === 'add' ? 'welcome' : 'bye'
      )
    } catch (e) {
      console.error('Welcome/Bye Canvas Error:', e)
    }
  })
}
