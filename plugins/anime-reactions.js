import fetch from 'node-fetch'

const endpoints = {
  hug: 'https://nekos.best/api/v2/hug',
  kiss: 'https://nekos.best/api/v2/kiss',
  pat: 'https://nekos.best/api/v2/pat',
  slap: 'https://nekos.best/api/v2/slap'
}

const getReaction = async (type) => {
  try {
    const res = await fetch(endpoints[type])
    const json = await res.json()
    
    if (json && json.results && json.results && json.results.url) {
      return json.results.url
    }
    return null
  } catch (error) {
    console.error(`Error obteniendo ${type}:`, error)
    return null
  }
}

export default {
  command: ['hug', 'kiss', 'pat', 'slap'],
  description: 'Reacciones anime',
  execute: async ({ sock, m, command }) => {
    try {
      const url = await getReaction(command)

      if (!url) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: 'No se pudo obtener la reacción 😿' },
          { quoted: m }
        )
      }

      await sock.sendMessage(
        m.key.remoteJid,
        {
          video: { url },
          caption: `*${command.toUpperCase()}* 💕`,
          gifPlayback: true
        },
        { quoted: m }
      )
    } catch (error) {
      console.error('Error en reacciones anime:', error)
    }
  }
}
