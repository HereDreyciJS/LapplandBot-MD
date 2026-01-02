export default {
  command: ['autoadmin'],
  description: 'Hace admin al owner que ejecute el comando en el grupo',
  owner: true,
  execute: async ({ sock, m, isGroup, isOwner }) => {
    try {
      if (!isGroup) {
        return sock.sendMessage(m.key.remoteJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: m })
      }

      if (!isOwner) {
        return sock.sendMessage(m.key.remoteJid, { text: '❌ Solo los owners pueden usar este comando.' }, { quoted: m })
      }

      const groupMetadata = await sock.groupMetadata(m.key.remoteJid)
      const senderJid = m.key.participant || m.key.remoteJid
      const participant = groupMetadata.participants.find(p => p.id === senderJid)

      if (participant?.admin || participant?.isSuperAdmin) {
        return sock.sendMessage(m.key.remoteJid, { text: '✅ Ya eres administrador en este grupo.' }, { quoted: m })
      }

      await sock.groupMakeAdmin(m.key.remoteJid, [senderJid])
      await sock.sendMessage(m.key.remoteJid, { text: '✅ Ahora eres administrador en este grupo.' }, { quoted: m })

    } catch (e) {
      console.error(e)
      await sock.sendMessage(m.key.remoteJid, { text: `❌ Ocurrió un error: ${e.message}` }, { quoted: m })
    }
  }
}
