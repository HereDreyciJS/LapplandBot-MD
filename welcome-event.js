export const setupWelcome = (sock) => {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const jid = update.id
      const chat = global.db.getChat(jid)
      if (!chat?.welcome) return

      const meta = await sock.groupMetadata(jid)
      const groupName = meta.subject
      const mentions = update.participants

      const textMentions = mentions
        .map(u => `@~${u.split('@')[0]}`)
        .join('\n')

      if (update.action === 'add') {
        const text =
`✧𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈 𝖺 ${groupName}!
${textMentions}
${chat.welcomeText || ''}`

        const pp = await sock.profilePictureUrl(sock.user.id, 'image').catch(() => null)

        await sock.sendMessage(jid, {
          image: pp ? { url: pp } : undefined,
          caption: text,
          mentions
        })
      }

      if (update.action === 'remove') {
        const text =
`👋 Hasta luego de ${groupName}
${textMentions}
${chat.byeText || ''}`

        await sock.sendMessage(jid, {
          text,
          mentions
        })
      }
    } catch {}
  })
}
