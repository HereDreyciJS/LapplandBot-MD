import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginsDir = path.join(__dirname, '../plugins')

global.plugins = new Map()

export const loadPlugins = async () => {
  global.plugins.clear()

  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir)
  }

  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

  for (const file of files) {
    try {
      const pluginPath = `../plugins/${file}`
      const mod = await import(`${pluginPath}?t=${Date.now()}`)
      const plugin = mod.default

      if (!plugin || !plugin.command) continue

      const commands = Array.isArray(plugin.command)
        ? plugin.command
        : [plugin.command]

      for (const cmd of commands) {
        global.plugins.set(cmd, plugin)
      }

      console.log(`Loaded plugin: ${file}`)
    } catch (e) {
      console.error(`Error loading plugin ${file}:`, e)
    }
  }
}
