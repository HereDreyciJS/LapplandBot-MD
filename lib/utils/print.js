import chalk from 'chalk'

export default async function print(
  sock,
  msg,
  body,
  isCommand,
  isGroup,
  eventType = null
) {
  try {
    const sender =
      msg?.pushName ||
      (isGroup ? 'Usuario del grupo' : 'Usuario')

    let chat = 'Privado'

    if (isGroup && msg?.key?.remoteJid) {
      try {
        const meta = await sock.groupMetadata(msg.key.remoteJid)
        chat = meta?.subject || 'Grupo'
      } catch {
        chat = 'Grupo'
      }
    }

    let detectedEvent = 'Ninguno'

    if (eventType) {
      detectedEvent = eventType
    } else if (msg?.message?.stickerMessage) {
      detectedEvent = 'sticker'
    } else if (msg?.messageStubType) {
      detectedEvent = 'evento'
    }

    const type =
      isCommand ? 'Comando' :
      msg?.message?.stickerMessage ? 'Sticker' :
      'Texto'

    const text =
      msg?.message?.stickerMessage
        ? '[Sticker]'
        : body || '[Sin texto]'

    console.log(
      chalk.gray('────────────────────────────'),
      `\n${chalk.cyan('Remitente:')} ${sender}`,
      `\n${chalk.cyan('Chat:')} ${chat}`,
      `\n${chalk.cyan('Tipo:')} ${type}`,
      `\n${chalk.cyan('Evento:')} ${detectedEvent}`,
      `\n${chalk.cyan('Mensaje:')}\n${text}`,
      `\n${chalk.gray('────────────────────────────')}\n`
    )
  } catch (e) {
    console.error('❌ Error en print:', e)
  }
}
