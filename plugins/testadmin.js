export default {
  command: ['soyadmin'],
  execute: async ({ sock, m, isAdmin }) => {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `Admin detectado: ${isAdmin}` },
      { quoted: m }
    )
  }
}
