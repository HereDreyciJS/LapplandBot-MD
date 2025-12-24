// me dio flojera ser el rw asi que se usara el api de alaya

import fs from 'fs'
import fetch from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'

const obtenerImagen = async (keyword) => {
  try {
    const url = `https://api.delirius.store/search/gelbooru?query=${encodeURIComponent(keyword)}`
    const res = await fetch(url)
    const json = await res.json()

    const valid = json?.data?.filter(
      i => typeof i.image === 'string' && /\.(jpg|jpeg|png)$/i.test(i.image)
    )

    if (!valid?.length) return null
    return valid[Math.floor(Math.random() * valid.length)].image
  } catch {
    return null
  }
}

const obtenerPersonajes = () => {
  try {
    return JSON.parse(fs.readFileSync('./lib/characters.json', 'utf-8'))
  } catch {
    return []
  }
}

const msToTime = (ms) => {
  const s = Math.floor(ms / 1000) % 60
  const m = Math.floor(ms / 60000) % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default {
  command: ['rw', 'roll', 'rollwaifu', 'rf'],
  description: 'Obtén un personaje aleatorio del gacha',
  execute: async ({ sock, m }) => {
    const db = global.db.data
    const chatId = m.key.remoteJid
    const userId = m.key.participant || m.key.remoteJid
    const now = Date.now()

    const chat = db.chats[chatId]
    const user = chat.users[userId]

    if (chat.adminonly || !chat.gacha) {
      return sock.sendMessage(
        chatId,
        { text: '✿ El sistema *gacha* está desactivado en este grupo.' },
        { quoted: m }
      )
    }

    const restante = (user.rwCooldown || 0) - now
    if (restante > 0) {
      return sock.sendMessage(
        chatId,
        { text: `✿ Espera *${msToTime(restante)}* para volver a usar este comando.` },
        { quoted: m }
      )
    }

    const personajes = obtenerPersonajes()
    const personaje = personajes[Math.floor(Math.random() * personajes.length)]
    if (!personaje) {
      return sock.sendMessage(
        chatId,
        { text: '✿ No se encontró ningún personaje disponible.' },
        { quoted: m }
      )
    }

    const reservado = chat.personajesReservados?.find(p => p.name === personaje.name)

    const poseedor = Object.entries(chat.users).find(
      ([_, u]) => Array.isArray(u.characters) && u.characters.some(c => c.name === personaje.name)
    )

    let estado = 'Libre'
    if (poseedor) estado = 'Reclamado'
    else if (reservado) estado = 'Reservado'

    user.rwCooldown = now + 15 * 60_000

    const valor = typeof personaje.value === 'number'
      ? personaje.value.toLocaleString()
      : '0'

    const mensaje =
`┏━ *Waifu Roll* ━⊜
┃✦ *Nombre*   :: ${personaje.name}
┃✧ *Género*   :: ${personaje.gender || 'Desconocido'}
┃✦ *Valor*    :: ${valor}
┃✧ *Estado*   :: ${estado}
┃✦ *Fuente*   :: ${personaje.source || 'Desconocido'}
┗━━◘`

    const imagen = await obtenerImagen(personaje.keyword)

    await sock.sendMessage(
      chatId,
      {
        image: imagen ? { url: imagen } : undefined,
        caption: mensaje
      },
      { quoted: m }
    )

    if (!poseedor && !reservado) {
      chat.personajesReservados.push({
        ...personaje,
        id: uuidv4().slice(0, 8),
        reservedBy: userId,
        expiresAt: now + 60_000
      })
    }
  }
}
