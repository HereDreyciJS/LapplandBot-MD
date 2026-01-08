export default {
  command: ['testmention'],
  execute: async ({ sock, m }) => {
    const jid = m.key.participant || m.key.remoteJid
    const user = global.db.getUser(jid)

    const numberTag = `@${jid.split('@')[0]}`
    const name = user?.name || numberTag

    const text = `Hola ${numberTag}, esta es una prueba de mención.`

    await sock.sendMessage(
      m.key.remoteJid,
      {
        text: text.replace(numberTag, name),
        mentions: [jid]
      },
      { quoted: m }
    )
  }
}
