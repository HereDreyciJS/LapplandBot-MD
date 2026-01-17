import { promises as fs } from 'fs'
import path from 'path'
import _ from 'lodash'
import yargs from 'yargs/yargs'

global.opts = Object(
  yargs(process.argv.slice(2))
    .exitProcess(false)
    .parse()
)

const root = process.cwd()
const dbFolder = path.join(root, 'lib', 'database')
const dbFile = path.join(dbFolder, 'ScriptNex.json')

await fs.mkdir(dbFolder, { recursive: true }).catch(() => {})

try {
  await fs.access(dbFile)
} catch {
  await fs.writeFile(dbFile, JSON.stringify({ users: {}, chats: {} }, null, 2))
}

async function readDB() {
  try {
    const data = await fs.readFile(dbFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { users: {}, chats: {} }
  }
}

async function writeDB(data) {
  try {
    const tmp = dbFile + '.tmp'
    await fs.writeFile(tmp, JSON.stringify(data, null, 2))
    await fs.rename(tmp, dbFile)
  } catch (e) {
    console.error('DB WRITE ERROR:', e)
  }
}

const snapshot = obj => JSON.stringify(obj).length

global.db = {
  data: await readDB(),
  defaults: {
    users: {
      exp: 0,
      level: 1,
      money: 0,
      premium: false,
      banned: false,
      lastCmd: 0
    },
    chats: {
      welcome: false,
      antilink: false,
      nsfw: false,
      socketOnly: false
    }
  },
  _snapshot: {
    users: 0,
    chats: 0
  },
  lastSave: 0
}

global.DATABASE = global.db

Object.freeze(global.db.defaults.users)
Object.freeze(global.db.defaults.chats)

global.loadDatabase = function () {
  global.db._snapshot.users = snapshot(global.db.data.users)
  global.db._snapshot.chats = snapshot(global.db.data.chats)
  return global.db.data
}

global.db.getUser = function (jid) {
  if (!global.db.data.users[jid]) {
    global.db.data.users[jid] = { ...global.db.defaults.users }
  }
  return global.db.data.users[jid]
}

global.db.getChat = function (jid) {
  if (!global.db.data.chats[jid]) {
    global.db.data.chats[jid] = { ...global.db.defaults.chats }
  } else if (typeof global.db.data.chats[jid].socketOnly !== 'boolean') {
    global.db.data.chats[jid].socketOnly = false
  }
  return global.db.data.chats[jid]
}

function hasPendingChanges() {
  const { users, chats } = global.db.data
  return (
    global.db._snapshot.users !== snapshot(users) ||
    global.db._snapshot.chats !== snapshot(chats)
  )
}

global.saveDatabase = async function () {
  const now = Date.now()
  if (!hasPendingChanges() || now - global.db.lastSave < 5000) return
  await writeDB(global.db.data)
  global.db.lastSave = now
  global.db._snapshot.users = snapshot(global.db.data.users)
  global.db._snapshot.chats = snapshot(global.db.data.chats)
}

setInterval(async () => {
  try {
    await global.saveDatabase()
  } catch (e) {
    console.error(e)
  }
}, 10000)

process.on('SIGINT', async () => {
  await global.saveDatabase()
  process.exit()
})

process.on('SIGTERM', async () => {
  await global.saveDatabase()
  process.exit()
})

export default global.db
