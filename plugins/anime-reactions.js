import fetch from 'node-fetch'

const actionPhrases = {
  hug: 'abrazó a',
  kiss: 'besó a',
  pat: 'acarició a',
  slap: 'le dio una cachetada a'
}

const getReactionData = async (type) => {
  try {
    const res = await fetch(`https://api.waifu.pics/sfw/${type}`)
    if (!res.ok) return null
    const json = await res.json()
    const url = json?.url
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
    await sock.sendPresenceUpdate('recording', m.key.remoteJid)

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

    const phrase = actionPhrases[command] || 'interactuó con'
    let caption = ''

    if (target) {
      caption = `@${sender.split('@')[0]} ${phrase} @${target.split('@')[0]}`
    } else {
      caption = `@${sender.split('@')[0]} se ${phrase.split(' ')[0]} a sí mismo`
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
