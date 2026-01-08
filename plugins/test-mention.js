export default {
  command: ['testmention'],
  execute: async ({ sock, m }) => {
    const jid = m.key.participant || m.key.remoteJid
    const tag = `@${jid.split('@')[0]}`

    await sock.sendMessage(
      m.key.remoteJid,
      {
        text: `Hola ${tag}, esta es una prueba de mención.`,
        mentions: [jid]
      },
      { quoted: m }
    )
  }
}
