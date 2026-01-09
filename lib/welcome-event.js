import { createCanvas, loadImage } from '@napi-rs/canvas'
import print from './utils/print.js'

export const setupWelcome = (sock) => {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      if (!['add', 'remove'].includes(update.action)) return

      const chat = global.db.getChat(update.id)
      if (!chat?.welcome) return

      const meta = await sock.groupMetadata(update.id)
      const groupName = meta?.subject || 'Grupo'

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

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'

      const isWelcome = update.action === 'add'

      ctx.font = 'bold 40px Sans'
      ctx.fillText(
        isWelcome
          ? '¡BIENVENID@!'
          : `¡Hasta luego de ${groupName}!`,
        canvas.width / 2,
        120
      )

      ctx.font = '32px Sans'
      ctx.fillText(displayName, canvas.width / 2, 190)

      ctx.font = '26px Sans'
      ctx.fillText(
        isWelcome ? groupName : '¡Que te vaya bien!',
        canvas.width / 2,
        250
      )

      const buffer = canvas.toBuffer('image/png')

      const caption = isWelcome
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
        isWelcome ? 'welcome' : 'bye'
      )
    } catch (e) {
      console.error('Welcome/Bye Canvas Error:', e)
    }
  })
}
