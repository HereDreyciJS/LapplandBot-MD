import { existsSync, mkdirSync, writeFile } from 'fs'
import path from 'path'
import sharp from 'sharp'

const welcomeDB = {}

// Ajustes globales por grupo
const dbPath = './database/welcome.json'
if (!existsSync('./database')) mkdirSync('./database', { recursive: true })

export function loadWelcome() {
  try {
    const data = require(dbPath)
    Object.assign(welcomeDB, data)
  } catch {
    writeFile(dbPath, JSON.stringify({}), () => {})
  }
}

export function saveWelcome() {
  writeFile(dbPath, JSON.stringify(welcomeDB, null, 2), () => {})
}

export function setupWelcome(sock) {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const jidGroup = update.id
      const action = update.action
      const groupSettings = welcomeDB[jidGroup]
      if (!groupSettings || !groupSettings.enabled) return

      const groupMeta = await sock.groupMetadata(jidGroup)
      const groupName = groupMeta.subject || 'este grupo'

      for (const participant of update.participants) {
        const userJid = participant
        let userName = userJid.split('@')[0]

        let text = ''
        if (action === 'add') {
          text = `✧𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈 𝖺 ${groupName}!\n\n@${userName}`
          if (groupSettings.message) text += `\n\n${groupSettings.message}`
        } else if (action === 'remove') {
          text = `✧𝖣𝖾𝗌𝗉𝖾𝗋𝗍𝗂𝗗𝗈 𝖽𝖾 ${groupName}\n\n@${userName}`
          if (groupSettings.leaveMessage) text += `\n\n${groupSettings.leaveMessage}`
        } else continue

        let groupPicBuffer
        try {
          groupPicBuffer = await sock.profilePictureUrl(jidGroup, 'image')
            .then(url => fetch(url).then(r => r.arrayBuffer()))
            .then(ab => Buffer.from(ab))
        } catch {
          groupPicBuffer = Buffer.alloc(0)
        }

        let userPicBuffer
        try {
          userPicBuffer = await sock.profilePictureUrl(userJid, 'image')
            .then(url => fetch(url).then(r => r.arrayBuffer()))
            .then(ab => Buffer.from(ab))
        } catch {
          userPicBuffer = Buffer.alloc(0)
        }

        // Combinación con sharp
        let composite = sharp({
          create: {
            width: 1024,
            height: 1024,
            channels: 3,
            background: '#ffffff'
          }
        })

        if (groupPicBuffer.length) {
          composite = composite.composite([{ input: groupPicBuffer, blend: 'over' }])
        }

        if (userPicBuffer.length) {
          composite = composite.composite([{
            input: userPicBuffer,
            top: 720,
            left: 400,
            blend: 'over',
            gravity: 'center'
          }])
        }

        const bufferFinal = await composite
          .png()
          .toBuffer()

        await sock.sendMessage(jidGroup, {
          image: bufferFinal,
          caption: text,
          mentions: [userJid]
        })
      }
    } catch (e) {
      console.error('WelcomeEvent Error:', e)
    }
  })
}
