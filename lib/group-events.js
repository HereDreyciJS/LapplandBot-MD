export default async (sock) => {
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      if (!anu?.id || !Array.isArray(anu.participants)) return
      if (anu.id === 'status@broadcast') return
      if (anu.action !== 'promote' && anu.action !== 'demote') return
      if (!anu.author) return

      const mentions = []
      const targets = []

      for (const p of anu.participants) {
        const jid = typeof p === 'string' ? p : p?.id || p?.lid
        if (!jid) continue
        mentions.push(jid)
        targets.push(`@${jid.split('@')[0]}`)
      }

      if (!targets.length) return

      const actor = `@${anu.author.split('@')[0]}`
      mentions.push(anu.author)

      const text =
        anu.action === 'promote'
          ? `✅ ${actor} promovió a ${targets.join(', ')} a admin`
          : `❌ ${actor} degradó a ${targets.join(', ')} de admin`

      await sock.sendMessage(anu.id, { text, mentions })

    } catch (e) {
      console.error('GROUP EVENT ERROR:', e)
    }
  })
}
