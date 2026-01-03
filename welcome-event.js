import { readFile } from 'fs/promises'
import sharp from 'sharp'

const defaultWelcome = {
  enabled: true,
  message: '¡Bienvenido al grupo!',
  goodbye: '¡Hasta luego!',
}

const db = global.db || { chats: {} }

function getChat(jid) {
  if (!db.chats[jid]) db.chats[jid] = { welcome: { ...defaultWelcome } }
  return db.chats[jid]
}

export function setupWelcome(sock) {
  sock.ev.on('group-participants.update', async (event) => {
    try {
      const jid = event.id
      const chat = getChat(jid)
      if (!chat.welcome.enabled) return

      const action = event.action
      const participants = event.participants

      let groupPic
      try {
        groupPic = await sock.profilePictureUrl(jid, 'image')
      } catch {
        groupPic = null
      }

      let groupBuffer
      if (groupPic) {
        const response = await fetch(groupPic)
        const buf = Buffer.from(await response.arrayBuffer())
        groupBuffer = await sharp(buf).resize(1024, 1024).png().toBuffer()
      }

      for (const user of participants) {
        let userPic
        try {
          userPic = await sock.profilePictureUrl(user, 'image')
        } catch {
          userPic = null
        }

        let userBuffer
        if (userPic) {
          const response = await fetch(userPic)
          const buf = Buffer.from(await response.arrayBuffer())
          userBuffer = await sharp(buf).resize(256, 256).png().toBuffer()
        }

        let image
        if (groupBuffer && userBuffer) {
          image = await sharp(groupBuffer)
            .composite([{ input: userBuffer, top: 768, left: 384 }])
            .png()
            .toBuffer()
        } else {
          image = groupBuffer
        }

        const mentions = [user]
        let text
        if (action === 'add') {
          text = `${chat.welcome.message}\n\n${participants.map(u => '@' + u.split('@')[0]).join('\n')}`
        } else if (action === 'remove') {
          text = `${chat.welcome.goodbye}\n\n${participants.map(u => '@' + u.split('@')[0]).join('\n')}`
        } else continue

        await sock.sendMessage(jid, {
          image,
          caption: text,
          mentions,
        })
      }
    } catch (e) {
      console.error('WelcomeEvent Error:', e)
    }
  })
}
