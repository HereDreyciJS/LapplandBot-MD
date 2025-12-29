export default {
  command: ['tag', 'tagall', 'todos'],
  description: 'Menciona a todos de forma invisible (Solo Admins)',
  execute: async ({ sock, m, args }) => {
    try {

      if (!m.key.remoteJid.endsWith('@g.us')) return

      
      const groupMetadata = await sock.groupMetadata(m.key.remoteJid)
      const participants = groupMetadata.participants
      
      const admins = participants.filter(p => p.admin !== null).map(p => p.id)
      const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net')
      const isUserAdmin = admins.includes(m.key.participant || m.key.remoteJid)

      if (!isUserAdmin) {
        return sock.sendMessage(m.key.remoteJid, { text: '❌ Este comando es solo para administradores.' }, { quoted: m })
      }

      const mentions = participants.map(p => p.id)
      
      const textTag = args.length > 0 ? args.join(' ') : 'ATENCION A TODOS 📢'

   
      await sock.sendMessage(
        m.key.remoteJid,
        { 
          text: textTag, 
          mentions: mentions 
        }
      )

    } catch (e) {
      console.error('Error en Tagall invisible:', e)
    }
  }
}
