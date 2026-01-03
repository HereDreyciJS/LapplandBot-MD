export default function setupWelcome(sock) {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action } = update
      if (!id.endsWith('@g.us')) return

      const chat = global.db.getChat(id)
      if (!chat || !chat.welcome) return

      if (action !== 'add' && action !== 'remove') return

      const metadata = await sock.groupMetadata(id)
      const groupName = metadata.subject

      const botJid = sock.user.id
      const botPP = await sock.profilePictureUrl(botJid, 'image').catch(() => null)

      let mentions = []
      let usersText = ''

      for (const jid of participants) {
        mentions.push(jid)
        usersText += `@${jid.split('@')[0]}\n`
      }

      let text = ''

      if (action === 'add') {
        text =
`✧𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈 𝖺 ${groupName}!
${usersText}
${chat.welcomeText || 'Esperamos que disfrutes tu estadía 💫'}`
      }

      if (action === 'remove') {
        text =
`✧𝖣𝖾𝗌𝗉𝖾𝖽𝗂𝖽𝖺
${usersText}
${chat.byeText || 'Te deseamos lo mejor 🍃'}`
      }

      await sock.sendMessage(id, {
        image: botPP ? { url: botPP } : undefined,
        caption: text,
        mentions
      })
    } catch (e) {
      console.error('WelcomeEvent Error:', e)
    }
  })
}
