import Canvas from 'canvas'
import fetch from 'node-fetch'

const db = global.db || {
  chats: {},
  getChat: (id) => db.chats[id] || { welcome: true, goodbye: true },
  setChat: (id, data) => { db.chats[id] = { ...(db.chats[id] || {}), ...data } }
}

async function generateCard(groupName, users, groupProfileUrl) {
  const width = 800
  const height = 400
  const canvas = Canvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Fondo: foto del grupo
  if (groupProfileUrl) {
    const res = await fetch(groupProfileUrl)
    const img = await Canvas.loadImage(await res.buffer())
    ctx.drawImage(img, 0, 0, width, height)
  } else {
    ctx.fillStyle = '#2C2F33'
    ctx.fillRect(0, 0, width, height)
  }

  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillRect(0, 0, width, height)

  // Texto arriba
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 40px Sans'
  ctx.textAlign = 'center'
  ctx.fillText(`✧ Bienvenido a ${groupName}!`, width / 2, 60)

  // Dibujar los avatares de los usuarios
  const avatarSize = 100
  let startX = width / 2 - ((users.length - 1) * (avatarSize + 20)) / 2
  const y = height / 2
  for (let u of users) {
    if (!u.profileUrl) continue
    try {
      const res = await fetch(u.profileUrl)
      const img = await Canvas.loadImage(await res.buffer())
      ctx.save()
      ctx.beginPath()
      ctx.arc(startX + avatarSize / 2, y, avatarSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(img, startX, y - avatarSize / 2, avatarSize, avatarSize)
      ctx.restore()
      startX += avatarSize + 20
    } catch {}
  }

  // Texto abajo con nombres
  ctx.fillStyle = '#ffffff'
  ctx.font = '30px Sans'
  let textY = height - 60
  for (let u of users) {
    ctx.fillText(`@${u.pushName}`, width / 2, textY)
    textY += 35
  }

  return canvas.toBuffer()
}

export async function setupWelcome(sock) {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const chat = db.getChat(update.id)
      const groupMeta = await sock.groupMetadata(update.id)
      const groupProfileUrl = await sock.profilePictureUrl(update.id, 'image').catch(() => null)

      if (update.action === 'add' && chat.welcome) {
        const users = []
        for (let jid of update.participants) {
          const profileUrl = await sock.profilePictureUrl(jid, 'image').catch(() => null)
          const pushName = (await sock.onWhatsApp(jid))[0]?.notify || jid.split('@')[0]
          users.push({ jid, profileUrl, pushName })
        }
        const card = await generateCard(groupMeta.subject, users, groupProfileUrl)
        await sock.sendMessage(update.id, {
          image: card,
          caption: '¡Disfruta tu estadía!',
          mentions: users.map(u => u.jid)
        })
      }

      if (update.action === 'remove' && chat.goodbye) {
        const users = []
        for (let jid of update.participants) {
          const profileUrl = await sock.profilePictureUrl(jid, 'image').catch(() => null)
          const pushName = (await sock.onWhatsApp(jid))[0]?.notify || jid.split('@')[0]
          users.push({ jid, profileUrl, pushName })
        }
        const card = await generateCard(groupMeta.subject, users, groupProfileUrl)
        await sock.sendMessage(update.id, {
          image: card,
          caption: '¡Hasta luego!',
          mentions: users.map(u => u.jid)
        })
      }
    } catch (e) {
      console.error('WelcomeEvent Error:', e)
    }
  })
}
