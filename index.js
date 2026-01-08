import 'dotenv/config'
import './lib/system/database.js'
import settings from './settings.js'
import { startConnection } from './lib/connection.js'
import { loadPlugins } from './lib/plugins.js'
import { handler } from './handler.js'
import { setupWelcome } from './welcome-event.js'

let sock
let starting = false

const start = async () => {
  if (starting) return
  starting = true

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
        console.log('✅ Bot conectado')
      }

      if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode
        console.log('❌ Conexión cerrada:', code)

        if (code !== 401) {
          console.log('🔄 Reconectando...')
          starting = false
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
        console.error('❌ Error en messages.upsert:', e)
      }
    })

  } catch (e) {
    console.error('❌ Error al iniciar el bot:', e)
  } finally {
    starting = false
  }
}

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

start()
