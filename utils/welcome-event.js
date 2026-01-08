import { createCanvas, loadImage } from '@napi-rs/canvas'

export const setupWelcome = (sock) => {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const chat = global.db.getChat(update.id)
      if (!chat?.welcome) return
      if (update.action !== 'add') return

      const meta = await sock.groupMetadata(update.id)
      const groupName = meta.subject

      const users = update.participants
        .map(p => typeof p === 'string' ? p : p?.id || p?.lid)
        .filter(Boolean)

      if (!users.length) return

      const jid = users[0]
      const user = global.db.getUser(jid)

      const displayName = user?.name
        ? user.name
        : `@${jid.split('@')[0]}`

      let groupPic = null
      try {
        const url = await sock.profilePictureUrl(update.id, 'image')
        groupPic = await loadImage(url)
      } catch {
        groupPic = null
      }

      const canvas = createCanvas(720, 400)
      const ctx = canvas.getContext('2d')

      if (groupPic) {
        ctx.drawImage(groupPic, 0, 0, canvas.width, canvas.height)
      } else {
        ctx.fillStyle = '#1e1e1e'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'

      ctx.font = 'bold 40px Sans'
      ctx.fillText('¡BIENVENID@!', canvas.width / 2, 120)

      ctx.font = '32px Sans'
      ctx.fillText(displayName, canvas.width / 2, 190)

      ctx.font = '26px Sans'
      ctx.fillText(groupName, canvas.width / 2, 250)

      const buffer = canvas.toBuffer('image/png')

      await sock.sendMessage(update.id, {
        image: buffer,
        caption: chat.welcomeText || '¡Disfruta de tu estadía!',
        mentions: user?.name ? [] : [jid]
      })

    } catch (e) {
      console.error('Welcome Canvas Error:', e)
    }
  })
}
