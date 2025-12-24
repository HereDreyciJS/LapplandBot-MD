import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import yargs from 'yargs/yargs'

global.opts = Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

const root = process.cwd()
const dbFolder = path.join(root, 'lib', 'database')
const dbFile = path.join(dbFolder, 'ScriptNex.json')

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true })
}

if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(
    dbFile,
    JSON.stringify(
      {
        users: {},
        chats: {}
      },
      null,
      2
    )
  )
}

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(dbFile))
  } catch {
    return { users: {}, chats: {} }
  }
}

function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2))
}

global.db = {
  data: readDB(),
  chain: null,
  READ: false,
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
      nsfw: false
    }
  },
  _snapshot: {
    users: '',
    chats: ''
  }
}

global.DATABASE = global.db

global.loadDatabase = function () {
  if (global.db.READ) return global.db.data
  global.db.READ = true

  global.db.chain = _.chain(global.db.data)

  global.db._snapshot.users = JSON.stringify(global.db.data.users)
  global.db._snapshot.chats = JSON.stringify(global.db.data.chats)

  global.db.READ = false
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
  }
  return global.db.data.chats[jid]
}

function hasPendingChanges() {
  const { users, chats } = global.db.data
  const snap = global.db._snapshot

  return (
    snap.users !== JSON.stringify(users) ||
    snap.chats !== JSON.stringify(chats)
  )
}

global.saveDatabase = function () {
  if (!hasPendingChanges()) return

  writeDB(global.db.data)

  global.db._snapshot.users = JSON.stringify(global.db.data.users)
  global.db._snapshot.chats = JSON.stringify(global.db.data.chats)
}

let lastSave = Date.now()

setInterval(() => {
  const now = Date.now()
  if (now - lastSave >= 1000 && hasPendingChanges()) {
    global.saveDatabase()
    lastSave = now
  }
}, 500)

process.on('SIGINT', () => {
  global.saveDatabase()
  process.exit()
})

process.on('SIGTERM', () => {
  global.saveDatabase()
  process.exit()
})

export default global.db
