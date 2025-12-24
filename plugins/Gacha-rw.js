// Creaditos @Neykoor no borrar 
// repositorio del dev: https://github.com/ScriptNex


import fs from 'fs'
import { media } from '../lib/utils/media.js'

const loadCharacters = () => {
  try {
    const raw = fs.readFileSync('./lib/characters.json', 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const msToTime = (ms) => {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  return h
    ? `${h}h ${m % 60}m`
    : m
    ? `${m}m ${s % 60}s`
    : `${s}s`
}

export default {
  command: ['rw', 'roll', 'rollwaifu'],
  description: 'Sorteo de personajes (Gacha público)',

  execute: async ({ sock, m }) => {
    const chatId = m.key.remoteJid
    const userId = m.sender
    const now = Date.now()

    const db = global.db.data
    db.chats ||= {}
    db.chats[chatId] ||= { users: {} }
    db.chats[chatId].users ||= {}
    db.chats[chatId].users[userId] ||= {}

    const user = db.chats[chatId].users[userId]

    if (user.rwCooldown && user.rwCooldown > now) {
      return sock.sendMessage(
        chatId,
        { text: `⏳ Espera ${msToTime(user.rwCooldown - now)} para volver a usar el gacha.` },
        { quoted: m }
      )
    }

    const characters = loadCharacters()
    if (!characters.length) {
      return sock.sendMessage(
        chatId,
        { text: '❌ No hay personajes disponibles.' },
        { quoted: m }
      )
    }

    const character = characters[Math.floor(Math.random() * characters.length)]

    user.rwCooldown = now + 15 * 60 * 1000

    const imageUrl = media(`${character.folder}/${character.image}.jpg`)

    const text =
`┏━ *Waifu Roll* ━⊜
┃✦ *Nombre*   :: ${character.name}
┃✧ *Género*   :: ${character.gender}
┃✦ *Valor*    :: ${Number(character.value).toLocaleString()}
┃✧ *Rareza*   :: ${character.rarity}
┃✦ *Fuente*   :: ${character.source}
┗━━◘`

    if (imageUrl) {
      await sock.sendMessage(
        chatId,
        { image: { url: imageUrl }, caption: text },
        { quoted: m }
      )
    } else {
      await sock.sendMessage(
        chatId,
        { text },
        { quoted: m }
      )
    }
  }
}
