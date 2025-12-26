import fetch from 'node-fetch'

const endpoints = {
  hug: 'https://nekos.best/api/v2/hug',
  kiss: 'https://nekos.best/api/v2/kiss',
  pat: 'https://nekos.best/api/v2/pat',
  slap: 'https://nekos.best/api/v2/slap'
}

const getReactionData = async (type) => {
  try {
    const res = await fetch(endpoints[type])
    const json = await res.json()
    const url = json?.results?.[0]?.url
    if (!url) return null

    
    const videoRes = await fetch(url)
    const buffer = await videoRes.buffer()
    return buffer
  } catch (e) {
    console.error(e)
    return null
  }
}

export default {
  command: ['hug', 'kiss', 'pat', 'slap'],
  description: 'Reacciones anime con GIFs',
  execute: async ({ sock, m, command }) => {
    const buffer = await getReactionData(command)

    if (!buffer) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: 'No se pudo obtener la reacción 😿' },
        { quoted: m }
      )
    }

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
        video: buffer,
        caption: caption,
        gifPlayback: true,
        mentions: [sender, target].filter(Boolean)
      },
      { quoted: m }
    )
  }
}
