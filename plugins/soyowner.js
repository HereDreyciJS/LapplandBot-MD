export default {
  command: ['soyowner', 'isowner'],
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
      { text: '✅ Sí, eres el owner del bot.' },
      { quoted: m }
    )
  }
}
