import fetch from 'node-fetch'

const actionPhrases = {
  hug: 'abrazó a',
  kiss: 'besó a',
  pat: 'acarició a',
  slap: 'le dio una cachetada a'
}

export default {
  command: ['hug', 'kiss', 'pat', 'slap'],
  description: 'Reacciones anime con GIFs',
  execute: async ({ sock, m, command }) => {
    try {
      const res = await fetch(`https://deliriussapi-oficial.vercel.app/api/${command}`)
      const json = await res.json()
      const url = json.url

      if (!url) return

      const response = await fetch(url)
      const buffer = await response.buffer()

      const sender = m.key.participant || m.key.remoteJid
      const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      const quoted = m.message?.extendedTextMessage?.contextInfo?.participant
      const target = mentioned || quoted

      const phrase = actionPhrases[command] || 'interactuó con'
      let caption = target 
        ? `@${sender.split('@')[0]} ${phrase} @${target.split('@')[0]}`
        : `@${sender.split('@')[0]} se ${phrase.split(' ')[0]} a sí mismo`

      await sock.sendMessage(
        m.key.remoteJid,
        {
          video: buffer,
          caption: caption,
          gifPlayback: true,
          mimetype: 'video/mp4',
          mentions: [sender, target].filter(Boolean)
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
    }
  }
}
