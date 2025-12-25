import fetch from 'node-fetch'

export default {
  command: ['hug', 'kiss', 'pat', 'slap', 'bite', 'punch', 'cry', 'smile', 'blush', 'wave', 'dance', 'poke'],
  description: 'Reacciones anime',
  execute: async ({ sock, m, args, command, prefix, isGroup }) => {
    try {
      const reacciones = {
        hug: 'https://nekos.best/api/v2/hug',
        kiss: 'https://nekos.best/api/v2/kiss',
        pat: 'https://nekos.best/api/v2/pat',
        slap: 'https://nekos.best/api/v2/slap',
        bite: 'https://nekos.best/api/v2/bite',
        punch: 'https://nekos.best/api/v2/punch',
        cry: 'https://nekos.best/api/v2/cry',
        smile: 'https://nekos.best/api/v2/smile',
        blush: 'https://nekos.best/api/v2/blush',
        wave: 'https://nekos.best/api/v2/wave',
        dance: 'https://nekos.best/api/v2/dance',
        poke: 'https://nekos.best/api/v2/poke'
      }

      const apiUrl = reacciones[command]
      if (!apiUrl) return

      
      const response = await fetch(apiUrl)
      const data = await response.json()
      const gifUrl = data.results.url

      
      const imageResponse = await fetch(gifUrl)
      const imageBuffer = await imageResponse.buffer()

      
      const contextInfo = m.message?.extendedTextMessage?.contextInfo
      const mentioned = contextInfo?.mentionedJid || []
      const sender = m.key.participant || m.key.remoteJid
      const senderName = sender.split('@')

      
      let caption = `*${command.toUpperCase()}* 💕`
      
      if (mentioned.length > 0) {
        const targetName = mentioned.split('@')
        caption = `@${senderName} usó *${command}* en @${targetName} 💕`
      }

      
      await sock.sendMessage(m.key.remoteJid, {
        image: imageBuffer,
        caption: caption,
        mentions: mentioned.length > 0 ? [sender, ...mentioned] : [sender],
        gifPlayback: true
      }, { 
        quoted: m
      })

    } catch (error) {
      console.error('Error en reacciones anime:', error)
      await sock.sendMessage(m.key.remoteJid, {
        text: '❌ Error al obtener la reacción. Intenta nuevamente.'
      }, { quoted: m })
    }
  }
}
