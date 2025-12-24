import chalk from 'chalk'

export default function print(msg, body, isCommand, isGroup) {
  try {
    const sender =
      msg.pushName ||
      (isGroup ? 'Usuario del grupo' : 'Usuario')

    const chat = isGroup ? 'Grupo' : 'Privado'
    const type = isCommand ? 'Comando' : 'Texto'
    const event = msg.messageStubType ? 'Evento' : 'Ninguno'
    const text = body || '[Sin texto]'

    console.log(
      chalk.gray('────────────────────────────'),
      `\n${chalk.cyan('Remitente:')} ${sender}`,
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
