import fs from 'fs'
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

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true })
}

if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(
    dbFile,
    JSON.stringify({ users: {}, chats: {} }, null, 2)
  )
}

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(dbFile, 'utf-8'))
  } catch {
    return { users: {}, chats: {} }
  }
}

function writeDB(data) {
  try {
    const tmp = dbFile + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
    fs.renameSync(tmp, dbFile)
  } catch (e) {
    console.error(e)
  }
}

const snapshot = (obj) => JSON.stringify(obj).length

global.db = {
  data: readDB(),
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
  }
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

global.saveDatabase = function () {
  if (!hasPendingChanges()) return
  writeDB(global.db.data)
  global.db._snapshot.users = snapshot(global.db.data.users)
  global.db._snapshot.chats = snapshot(global.db.data.chats)
}

setInterval(() => {
  try {
    global.saveDatabase()
  } catch (e) {
    console.error(e)
  }
}, 5000)

process.on('SIGINT', () => {
  global.saveDatabase()
  process.exit()
})

process.on('SIGTERM', () => {
  global.saveDatabase()
  process.exit()
})

export default global.db
