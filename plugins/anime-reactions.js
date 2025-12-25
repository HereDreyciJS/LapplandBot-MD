import fetch from 'node-fetch'

const endpoints = {
  hug: 'https://nekos.best/api/v2/hug',
  kiss: 'https://nekos.best/api/v2/kiss'
}

const getReaction = async (type) => {
  const res = await fetch(endpoints[type])
  const json = await res.json()
  return json?.results?.[0]?.url || null
}

export default {
  command: ['hug', 'kiss'],
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
        gifPlayback: true
      },
      { quoted: m }
    )
  }
}
