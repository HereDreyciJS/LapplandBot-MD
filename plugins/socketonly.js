export default {
  command: ['socketonly'],
  description: 'Activa/desactiva modo solo socket en el grupo',
  execute: async ({ sock, m, args }) => {
    const sender = m.key.participant || m.key.remoteJid
    const botJid = sock.user.id
    const groupJid = m.key.remoteJid
    if (!groupJid.endsWith('@g.us')) return
    if (sender !== botJid) return
    if (!args[0] || !['on','off'].includes(args[0].toLowerCase())) return
    if (args[0].toLowerCase() === 'on') global.socketOnlyGroups.set(groupJid, true)
    else global.socketOnlyGroups.set(groupJid, false)
  }
}
