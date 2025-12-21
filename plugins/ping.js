export default {
  command: ['ping'],
  execute: async ({ sock, m }) => {
    const start = Date.now()

    const sent = await sock.sendMessage(
      m.key.remoteJid,
      { text: '⏱️ Midiendo...' },
      { quoted: m }
    )

    const speed = Date.now() - start

    await sock.sendMessage(
      m.key.remoteJid,
      { text: `⚡ Velocidad: ${speed} ms` },
      { quoted: sent }
    )
  }
}
