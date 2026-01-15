export default async (sock) => {
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      if (!anu?.id || !anu.participants) return
      if (!['promote', 'demote'].includes(anu.action)) return

      const chatId = anu.id

      for (const p of anu.participants) {
        const jid = typeof p === 'object' ? p.id || p.lid : p
        if (!jid) continue

        const phone = jid.split('@')[0]

        if (anu.action === 'promote') {
          await sock.sendMessage(chatId, {
            text: `✅ @${phone} fue promovido a admin`,
            mentions: [jid]
          })
        }

        if (anu.action === 'demote') {
          await sock.sendMessage(chatId, {
            text: `❌ @${phone} fue degradado de admin`,
            mentions: [jid]
          })
        }
      }

    } catch (e) {
      console.error('GROUP EVENT ERROR:', e)
    }
  })
}
