import 'dotenv/config'
import './lib/system/database.js'
import settings from './settings.js'
import { startConnection } from './lib/connection.js'
import { loadPlugins } from './lib/plugins.js'
import { handler } from './handler.js'
import { setupWelcome } from './lib/welcome-event.js'
import groupEvents from './lib/group-events.js'

process.setMaxListeners(0)

let sock
let reconnecting = false

global.cooldowns ??= new Map()

const start = async () => {
  if (reconnecting) return
  reconnecting = true

  try {
    global.settings = settings

    if (typeof global.loadDatabase === 'function') {
      await global.loadDatabase()
    }

    await loadPlugins()
    sock = await startConnection()

    if (!global.mainBot) {
      global.mainBot = sock
      sock.isMainBot = true
      sock.isSubBot = false
    } else {
      sock.isMainBot = false
      sock.isSubBot = true
    }

    if (!global.conn) global.conn = sock

    setupWelcome(sock)
    groupEvents(sock)

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update

      if (connection === 'open') {
        reconnecting = false
        console.log(
          sock.isMainBot ? '✅ Bot ORIGINAL conectado' : '🟡 Sub-bot conectado'
        )
      }

      if (connection === 'close' && !reconnecting) {
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
      if (m.type !== 'notify' || !Array.isArray(m.messages)) return

      const validMsgs = m.messages.filter(msg => msg?.message && msg.key.remoteJid !== 'status@broadcast')

      await Promise.all(
        validMsgs.map(msg =>
          handler(sock, msg).catch(e => console.error('❌ Error en handler:', e))
        )
      )
    })

  } catch (e) {
    reconnecting = false
    console.error('❌ Error al iniciar:', e)
  }
}

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

start()
