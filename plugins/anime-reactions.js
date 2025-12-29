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
      const res = await fetch(`https://api.waifu.pics/sfw/${command}`)
      const json = await res.json()
      if (!json?.url) return

      const gifRes = await fetch(json.url)
      const gifBuffer = Buffer.from(await gifRes.arrayBuffer())

      const sender = m.key.participant || m.key.remoteJid
      const ctx = m.message?.extendedTextMessage?.contextInfo
      const mentioned = ctx?.mentionedJid?.[0]
      const quoted = ctx?.participant
      const target = mentioned || quoted

      const phrase = actionPhrases[command] || 'interactuó con'
      const caption = target
        ? `@${sender.split('@')[0]} ${phrase} @${target.split('@')[0]}`
        : `@${sender.split('@')[0]} se ${phrase.split(' ')[0]} a sí mismo`

      await sock.sendMessage(
        m.key.remoteJid,
        {
          document: gifBuffer,
          fileName: `${command}.gif`,
          mimetype: 'image/gif',
          caption,
          mentions: [sender, target].filter(Boolean)
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
    }
  }
}
