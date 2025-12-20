import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers
} from '@whiskeysockets/baileys'
import pino from 'pino'

export const startConnection = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('📌 Escanea este QR desde el panel')
      console.log(qr)
    }

    if (connection === 'open') {
      console.log('✅ Conectado a WhatsApp')
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      console.log('❌ Conexión cerrada:', code)

      if (code !== DisconnectReason.loggedOut) {
        setTimeout(() => startConnection(), 5000)
      } else {
        console.log('⚠️ Sesión cerrada, borra la carpeta /session')
      }
    }
  })

  return sock
}
