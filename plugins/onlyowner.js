export default {
  command: ['onlyowner', 'owneronly'],
  execute: async ({ sock, m, isOwner }) => {
    if (!isOwner) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: '❌ Este comando es solo para el owner.' },
        { quoted: m }
      )
    }

    await sock.sendMessage(
      m.key.remoteJid,
      { text: '✅ Comando ejecutado correctamente (owner).' },
      { quoted: m }
    )
  }
}
