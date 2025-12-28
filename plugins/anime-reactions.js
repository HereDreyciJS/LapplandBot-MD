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
      // Usamos waifu.pics que es la más compatible con buffers
      const res = await fetch(`https://api.waifu.pics/sfw/${command}`)
      const json = await res.json()
      if (!json.url) return

      // DESCARGA EL BUFFER (Esto evita el fondo borroso)
      const response = await fetch(json.url)
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
          video: buffer, // Enviamos el buffer directamente
          caption: caption,
          gifPlayback: true,
          mimetype: 'video/mp4', // Engañamos a WA para que lo procese como video
          mentions: [sender, target].filter(Boolean)
        },
        { quoted: m }
      )
    } catch (e) {
      console.error('Error en el plugin:', e)
    }
  }
}
