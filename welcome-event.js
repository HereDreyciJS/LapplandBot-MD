export const setupWelcome = (sock) => {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const chat = global.db.getChat(update.id)
      if (!chat?.welcome) return

      const meta = await sock.groupMetadata(update.id)
      const groupName = meta.subject
      const participants = meta.participants || []

      const users = update.participants
        .map(p => {
          if (typeof p === 'string') return p
          if (p?.id) return p.id
          if (p?.lid) return p.lid
          return null
        })
        .filter(Boolean)

      if (!users.length) return

      const names = users.map(jid => {
        const user = participants.find(p => p.id === jid || p.lid === jid)
        return (
          user?.notify ||
          user?.name ||
          user?.pushName ||
          'Nuevo usuario'
        )
      })

      let text = ''

      if (update.action === 'add') {
        text =
          `✧𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈 𝖺 ${groupName}!\n\n` +
          names.join('\n') +
          `\n\n${chat.welcomeText || '¡Disfruta de tu estadía!'}`
      }

      if (update.action === 'remove') {
        text =
          `✧𝖧𝖺𝗌𝗍𝖺 𝗅𝗎𝖾𝗀𝗈 de ${groupName}!\n\n` +
          names.join('\n') +
          `\n\n${chat.byeText || '¡Que te vaya bien!'}`
      }

      if (!text) return

      await sock.sendMessage(update.id, {
        text,
        mentions: users
      })
    } catch (e) {
      console.error('WelcomeEvent Error:', e)
    }
  })
}
