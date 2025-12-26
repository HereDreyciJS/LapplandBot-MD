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
    
    if (!json || !Array.isArray(json.results) || json.results.length === 0) {
      console.error('Respuesta de la API no es válida:', json)
      return null
    }
  
    const url = json.results.url
    
    if (!url) {
      console.error('URL no encontrada en la respuesta:', json)
      return null
    }
    
    return url
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

      const response = await fetch(url)
      const buffer = await response.buffer()

      await sock.sendMessage(
        m.key.remoteJid,
        {
          video: buffer,
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
