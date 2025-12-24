import chalk from 'chalk'

export default function print(msg, body, command, isGroup) {
  try {
    const senderJid = msg.key.participant || msg.key.remoteJid
    const senderName = senderJid.split('@')[0]

    const chat = isGroup ? 'Grupo' : 'Privado'
    const type = command ? 'Comando' : 'Texto'
    const event = msg.messageStubType ? 'Evento' : 'Ninguno'
    const text = body || '[Sin texto]'

    console.log(
      chalk.gray('────────────────────────────'),
      `\n${chalk.cyan('Remitente:')} ${senderName}`,
      `\n${chalk.cyan('Chat:')} ${chat}`,
      `\n${chalk.cyan('Tipo:')} ${type}`,
      `\n${chalk.cyan('Evento:')} ${event}`,
      `\n${chalk.cyan('Mensaje:')}\n${text}`,
      `\n${chalk.gray('────────────────────────────')}\n`
    )
  } catch (e) {
    console.error('❌ Error en print:', e)
  }
}
