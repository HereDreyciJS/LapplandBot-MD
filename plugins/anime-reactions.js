import fetch from 'node-fetch'

const endpoints = {
  hug: 'https://nekos.best/api/v2/hug',
  kiss: 'https://nekos.best/api/v2/kiss',
  pat: 'https://nekos.best/api/v2/pat',
  slap: 'https://nekos.best/api/v2/slap'
}

const getReaction = async (type) => {
  const res = await fetch(endpoints[type])
  const json = await res.json()
  return json?.results?.?.url || null
}

export default {
  command: ['hug', 'kiss', 'pat', 'slap'],
  description: 'Reacciones anime',
  execute: async ({ sock, m, command }) => {
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
  }
}
