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

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'open') {
        reconnecting = false
        if (process.env.DEBUG) {
          console.log(
            sock.isMainBot
              ? '✅ Bot ORIGINAL conectado'
              : '🟡 Sub-bot conectado'
          )
        }
      }

      if (connection === 'close') {
        reconnecting = false
        const code = lastDisconnect?.error?.output?.statusCode
        if (process.env.DEBUG) {
          console.log('❌ Conexión cerrada:', code)
        }
        if (code !== 401) start()
      }
    })

    sock.ev.on('messages.upsert', (m) => {
      if (m.type !== 'notify' || !Array.isArray(m.messages)) return

      for (const msg of m.messages) {
        if (!msg?.message) continue
        if (msg.key.remoteJid === 'status@broadcast') continue

        const jid = msg.key.participant || msg.key.remoteJid
        const now = Date.now()
        const last = global.cooldowns.get(jid) || 0

        if (now - last < 500) continue
        global.cooldowns.set(jid, now)

        handler(sock, msg).catch(e => {
          if (process.env.DEBUG) console.error('❌ Error en handler:', e)
        })
      }
    })

  } catch (e) {
    reconnecting = false
    console.error('❌ Error al iniciar:', e)
  }
}

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

start()
