import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers
} from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'

export const startConnection = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'info' }), // 🔴 NO silent
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ qr }) => {
    if (qr) {
      console.log('📌 Escanea este QR')
      qrcode.generate(qr, { small: true })
    }
  })

  return sock
}
