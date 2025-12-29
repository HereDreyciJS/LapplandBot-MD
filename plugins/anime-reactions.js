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
      // Pedimos la URL del GIF desde waifu.pics
      const res = await fetch(`https://api.waifu.pics/sfw/${command}`)
      if (!res.ok) throw new Error('Waifu API no respondió correctamente')
      const json = await res.json()
      if (!json.url) return

      // Descarga el GIF como buffer (compatibilidad node-fetch v3)
      const response = await fetch(json.url)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Identificar remitente y destinatario
      const sender = m.key.participant || m.key.remoteJid
      const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      const quoted = m.message?.extendedTextMessage?.contextInfo?.participant
      const target = mentioned || quoted

      // Generar frase del comando
      const phrase = actionPhrases[command] || 'interactuó con'
      const caption = target
        ? `@${sender.split('@')[0]} ${phrase} @${target.split('@')[0]}`
        : `@${sender.split('@')[0]} se ${phrase.split(' ')[0]} a sí mismo`

      // Enviar el GIF como video animado
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
      console.error('Error en el plugin:', e)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Error cargando el GIF' },
        { quoted: m }
      )
    }
  }
}
