import fetch from 'node-fetch'

const endpoints = {
  hug: 'https://nekos.best/api/v2/hug',
  kiss: 'https://nekos.best/api/v2/kiss',
  pat: 'https://nekos.best/api/v2/pat',
  slap: 'https://nekos.best/api/v2/slap',
  bite: 'https://nekos.best/api/v2/bite',
  punch: 'https://nekos.best/api/v2/punch',
  cry: 'https://nekos.best/api/v2/cry',
  smile: 'https://nekos.best/api/v2/smile',
  blush: 'https://nekos.best/api/v2/blush',
  wave: 'https://nekos.best/api/v2/wave'
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
  command: ['hug', 'kiss', 'pat', 'slap', 'bite', 'punch', 'cry', 'smile', 'blush', 'wave'],
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
          gifPlayback: true,
          mimetype: 'video/mp4'
        },
        { quoted: m }
      )
    } catch (error) {
      console.error('Error en reacciones anime:', error)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Error al enviar la reacción.' },
        { quoted: m }
      )
    }
  }
}
