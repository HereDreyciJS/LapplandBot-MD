import 'dotenv/config'
import './lib/system/database.js'
import settings from './settings.js'
import { startConnection } from './lib/connection.js'
import { loadPlugins } from './lib/plugins.js'
import { handler } from './handler.js'
import { setupWelcome } from './welcome-event.js'

const start = async () => {
  global.settings = settings

  if (typeof global.loadDatabase === 'function') {
    await global.loadDatabase()
  }

  await loadPlugins()

  const sock = await startConnection()

  setupWelcome(sock)
  
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return
    await handler(sock, m)
  })

  process.on('uncaughtException', () => {})
  process.on('unhandledRejection', () => {})
}

start()

