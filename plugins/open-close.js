export default {
  command: ['open', 'close', 'abrir', 'cerrar'],
  description: 'Abre o cierra el grupo (Solo Admins)',
  execute: async ({ sock, m, isAdmin, isGroup, command }) => {
    if (!isGroup) return
    
    if (!isAdmin) {
      return sock.sendMessage(m.key.remoteJid, { 
        text: '❌ Este comando solo puede ser usado por administradores.' 
      }, { quoted: m })
    }

    // Determinar la acción basada en el comando usado
    const isOpening = ['open', 'abrir'].includes(command)
    const setting = isOpening ? 'not_announcement' : 'announcement'

    try {
      await sock.groupSettingUpdate(m.key.remoteJid, setting)
      
      const text = isOpening 
        ? '🔓 *Grupo abierto.*\nAhora todos los participantes pueden enviar mensajes.' 
        : '🔒 *Grupo cerrado.*\nAhora solo los administradores pueden enviar mensajes.'

      await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m })
      
    } catch (e) {
      console.error('Error al cambiar ajuste del grupo:', e)
      await sock.sendMessage(m.key.remoteJid, { 
        text: '❌ Hubo un error. Asegúrate de que el bot sea administrador.' 
      }, { quoted: m })
    }
  }
}
