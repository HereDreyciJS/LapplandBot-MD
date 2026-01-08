export default {
  command: ['testmention'],
  execute: async ({ sock, m, user }) => {
    const jid = m.key.participant || m.key.remoteJid
    const name = user?.name || `@${jid.split('@')[0]}`

    await sock.sendMessage(
      m.key.remoteJid,
      {
        text: `Hola ${name}, esta es una prueba de mención.`,
        mentions: user?.name ? [] : [jid]
      },
      { quoted: m }
    )
  }
}
