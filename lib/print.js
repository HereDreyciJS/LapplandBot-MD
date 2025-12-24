import chalk from 'chalk'

export default function print({ msg, body, isCommand, store }) {
  try {
    const jid = msg.key.participant || msg.key.remoteJid
    const contact =
      store?.contacts?.[jid] ||
      store?.contacts?.[jid.split(':')[0] + '@s.whatsapp.net']

    const senderName =
      contact?.name ||
      contact?.notify ||
      msg.pushName ||
      jid.split('@')[0]

    let chatName = 'Privado'
    if (msg.key.remoteJid.endsWith('@g.us')) {
      const group = store?.groupMetadata?.[msg.key.remoteJid]
      chatName = group?.subject || 'Grupo'
    }

    const type = isCommand ? 'Comando' : 'Texto'
    const event = msg.messageStubType ? 'Evento' : 'Ninguno'
    const text = body || '[Sin texto]'

    console.log(
      chalk.gray('────────────────────────────'),
      `\n${chalk.cyan('Remitente:')} ${senderName}`,
      `\n${chalk.cyan('Chat:')} ${chatName}`,
      `\n${chalk.cyan('Tipo:')} ${type}`,
      `\n${chalk.cyan('Evento:')} ${event}`,
      `\n${chalk.cyan('Mensaje:')}\n${text}`,
      `\n${chalk.gray('────────────────────────────')}\n`
    )
  } catch (e) {
    console.error('❌ Error en print:', e)
  }
}
