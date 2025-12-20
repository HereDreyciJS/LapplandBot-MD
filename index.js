import './lib/system/database.js'
import { startConnection } from './lib/connection.js'
import { loadPlugins } from './lib/plugins.js'
import { handler } from './lib/handler.js'

const start = async () => {
  global.loadDatabase()

  console.log('Loading plugins...')
  await loadPlugins()

  console.log('Starting bot...')
  const sock = await startConnection()

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return
    await handler(sock, m)
  })

  process.on('uncaughtException', console.error)
  process.on('unhandledRejection', console.error)
}

start()
