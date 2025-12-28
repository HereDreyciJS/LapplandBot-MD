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
      const res = await fetch(`${global.APIs.delirius.url}/search/tenor?q=anime ${command}`)
      const json = await res.json()
      
      const results = json.data || json.results || []
      let mp4 = null

      if (results.length > 0) {
        const random = results[Math.floor(Math.random() * results.length)]
        mp4 = random.media_formats?.mp4?.url || random.url
      }

      if (!mp4) {
        const resBackup = await fetch(`https://api.waifu.pics/sfw/${command}`)
        const jsonBackup = await resBackup.json()
        mp4 = jsonBackup.url
      }

      if (!mp4) return

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
          video: { url: mp4 },
          caption: caption,
          gifPlayback: true,
          mimetype: 'video/mp4',
          mentions: [sender, target].filter(Boolean)
        },
        { quoted: m }
      )
    } catch (e) {
      console.error('Error en Reacciones:', e)
    }
  }
}
