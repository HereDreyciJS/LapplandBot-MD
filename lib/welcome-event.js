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

      ctx.textAlign = 'center'
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 6

      const drawAutoText = (text, y, maxWidth, maxFont) => {
        let size = maxFont
        do {
          ctx.font = `bold ${size}px Sans`
          if (ctx.measureText(text).width <= maxWidth) break
          size -= 2
        } while (size > 18)
        ctx.fillText(text, canvas.width / 2, y)
      }

      drawAutoText(
        update.action === 'add'
          ? `¡Bienvenid@ a ${groupName}!`
          : `¡Hasta luego de ${groupName}!`,
        90,
        640,
        42
      )

      if (avatar) {
        const size = 230
        const x = canvas.width / 2
        const y = 360
        const r = size / 2

        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(avatar, x - r, y - r, size, size)
        ctx.restore()
      }

      drawAutoText(displayName, 560, 600, 32)

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
