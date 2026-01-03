export const setupWelcome = async (sock) => {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const chat = global.db.getChat(update.id)
      if (!chat?.welcome) return

      const meta = await sock.groupMetadata(update.id)
      const groupName = meta.subject

      const users = update.participants.map(p => p.id || p.phoneNumber)
      const mentions = users.map(jid => jid.replace(/@.+/, ''))

      let text = ''

      if (update.action === 'add') {
        text =
          `✧𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈 𝖺 ${groupName}!\n\n` +
          mentions.map(u => `@${u}`).join('\n') +
          `\n\n${chat.welcomeText || '¡Disfruta de tu estadía!'}`
      }

      if (update.action === 'remove') {
        text =
          `✧𝖧𝖺𝗌𝗍𝖺 𝗅𝗎𝖾𝗀𝗈 de ${groupName}!\n\n` +
          mentions.map(u => `@${u}`).join('\n') +
          `\n\n${chat.byeText || '¡Que te vaya bien!'}`
      }

      if (!text) return

      let botProfile = null
      try {
        const botId = sock.user?.id || sock.user?.jid
        botProfile = await sock.profilePictureUrl(botId, 'image')
      } catch {
        botProfile = null
      }

      if (botProfile) {
        await sock.sendMessage(update.id, {
          image: { url: botProfile },
          caption: text,
          mentions: users
        })
      } else {
        await sock.sendMessage(update.id, {
          text,
          mentions: users
        })
      }
    } catch (e) {
      console.error('WelcomeEvent Error:', e)
    }
  })
}
