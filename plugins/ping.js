
export default {
  command: ['ping'],
  description: 'Mide el tiempo de respuesta del bot',
  execute: async ({ sock, m }) => {
    const start = Date.now()

    const sent = await sock.sendMessage(
      m.key.remoteJid,
      { text: '[::] Midiendo respuesta...' },
      { quoted: m }
    )

    const speed = Date.now() - start

    const text =
      '[✓] Ping completado\n' +
      `> Tiempo de respuesta: ${speed} ms\n` +
      '> Sirve para comprobar si el bot responde correctamente'

    await sock.sendMessage(
      m.key.remoteJid,
      { text },
      { quoted: sent }
    )
  }
}
