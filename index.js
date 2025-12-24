import './lib/system/database.js'
import settings from './settings.js'

import { startConnection } from './lib/connection.js'
import { loadPlugins } from './lib/plugins.js'
import { handler } from './handler.js'

import { makeInMemoryStore } from '@whiskeysockets/baileys'
import pino from 'pino'

const start = async () => {
  global.settings = settings
  global.loadDatabase()

  await loadPlugins()

  const store = makeInMemoryStore({
    logger: pino({ level: 'silent' })
  })

  const sock = await startConnection(store)

  store.bind(sock.ev)

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return
    await handler(sock, m, store)
  })

  process.on('uncaughtException', console.error)
  process.on('unhandledRejection', console.error)
}

start()
