
export default {
  command: ['debugowner'],
  execute: async ({ sock, m, isOwner }) => {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `Owner detectado: ${isOwner}` },
      { quoted: m }
    )
  }
}
