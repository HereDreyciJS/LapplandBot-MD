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
    // nekos.best devuelve los datos en results[0].url
    return json?.results?.[0]?.url || null
  } catch (e) {
    console.error('Error fetching reaction:', e)
    return null
  }
}

export default {
  command: ['hug', 'kiss', 'pat', 'slap'],
  description: 'Reacciones anime con GIFs',
  execute: async ({ sock, m, command }) => {
    const url = await getReaction(command)

    if (!url) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: 'No se pudo obtener la reacción 😿' },
        { quoted: m }
      )
    }

    // Extraemos menciones o respuesta a mensaje para el texto
    const sender = m.key.participant || m.key.remoteJid
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    const quoted = m.message?.extendedTextMessage?.contextInfo?.participant
    const target = mentioned || quoted

    let caption = `✨ /${command}`
    if (target) {
      caption = `@${sender.split('@')[0]} le dio un ${command} a @${target.split('@')[0]}`
    }

    await sock.sendMessage(
      m.key.remoteJid,
      {
        video: { url },
        caption: caption,
        gifPlayback: true,
        mentions: [sender, target].filter(Boolean)
      },
      { quoted: m }
    )
  }
}
