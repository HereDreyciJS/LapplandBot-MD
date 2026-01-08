export const setupWelcome = (sock) => {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const chat = global.db.getChat(update.id)
      if (!chat?.welcome) return

      const meta = await sock.groupMetadata(update.id)
      const groupName = meta.subject

      const users = update.participants
        .map(jid => jid?.toString())
        .filter(Boolean)

      if (!users.length) return

      const mentionsText = users
        .map(jid => `@${jid.split('@')[0]}`)
        .join('\n')

      let text = ''

      if (update.action === 'add') {
        text =
          `✧𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈 𝖺 ${groupName}!\n\n` +
          mentionsText +
          `\n\n${chat.welcomeText || '¡Disfruta de tu estadía!'}`
      }

      if (update.action === 'remove') {
        text =
          `✧𝖧𝖺𝗌𝗍𝖺 𝗅𝗎𝖾𝗀𝗈 de ${groupName}!\n\n` +
          mentionsText +
          `\n\n${chat.byeText || '¡Que te vaya bien!'}`
      }

      if (!text) return

      let groupProfile = null
      try {
        groupProfile = await sock.profilePictureUrl(update.id, 'image')
      } catch {
        groupProfile = null
      }

      if (groupProfile) {
        await sock.sendMessage(update.id, {
          image: { url: groupProfile },
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
