export default {
  command: ['ping', 'p'],
  description: 'Mide el tiempo de respuesta del bot',
  execute: async ({ sock, m }) => {
    const start = Date.now()

    const sent = await sock.sendMessage(
      m.key.remoteJid,
      { text: '[::] Midiendo respuesta...' },
      { quoted: m }
    )

    const latency = Date.now() - start

    const finalText =
      '[✓] Ping completado\n' +
      `> Tiempo de respuesta: ${latency} ms`

    await sock.sendMessage(
      m.key.remoteJid,
      {
        text: finalText,
        edit: sent.key
      },
      { quoted: m }
    )
  }
}
