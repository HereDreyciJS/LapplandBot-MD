import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers
} from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'

process.setMaxListeners(0)

export const startConnection = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'info' }),
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false
  })

  sock.ev.removeAllListeners()
  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', update => {
    const { qr, connection, lastDisconnect } = update

    if (qr) {
      console.log('📌 Escanea este QR')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      console.log('❌ Conexión cerrada:', code)
    }

    if (connection === 'open') {
      console.log('✅ Conectado a WhatsApp')
    }
  })

  return sock
}
