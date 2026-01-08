import 'dotenv/config'
import './lib/system/database.js'
import settings from './settings.js'
import { startConnection } from './lib/connection.js'
import { loadPlugins } from './lib/plugins.js'
import { handler } from './handler.js'
import { setupWelcome } from './utils/welcome-event.js'

let sock
let reconnecting = false

const start = async () => {
  try {
    global.settings = settings

    if (typeof global.loadDatabase === 'function') {
      await global.loadDatabase()
    }

    await loadPlugins()
    sock = await startConnection()

    setupWelcome(sock)

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update

      if (connection === 'open') {
        reconnecting = false
        console.log('✅ Bot conectado')
      }

      if (connection === 'close' && !reconnecting) {
        reconnecting = true
        const code = lastDisconnect?.error?.output?.statusCode
        console.log('❌ Conexión cerrada:', code)

        if (code !== 401) {
          start()
        } else {
          console.log('🚫 Sesión cerrada')
        }
      }
    })

    sock.ev.on('messages.upsert', async (m) => {
      try {
        if (m.type !== 'notify') return
        for (const msg of m.messages) {
          await handler(sock, msg)
        }
      } catch (e) {
        console.error('❌ Error en handler:', e)
      }
    })

  } catch (e) {
    console.error('❌ Error al iniciar:', e)
  }
}

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

start()

