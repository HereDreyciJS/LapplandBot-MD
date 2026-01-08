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
    fs.mkdirSync(pluginsDir, { recursive: true })
  }

  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

  for (const file of files) {
    try {
      const pluginPath = `../plugins/${file}`
      const mod = await import(`${pluginPath}?update=${Date.now()}`)
      const plugin = mod.default

      if (
        !plugin ||
        !plugin.command ||
        typeof plugin.execute !== 'function'
      ) {
        console.warn(`⚠️ Plugin inválido: ${file}`)
        continue
      }

      const commands = Array.isArray(plugin.command)
        ? plugin.command
        : [plugin.command]

      for (const cmd of commands) {
        if (global.plugins.has(cmd)) {
          console.warn(`⚠️ Comando duplicado "${cmd}" en ${file}`)
        }
        global.plugins.set(cmd, plugin)
      }

      console.log(`✅ Plugin cargado: ${file}`)
    } catch (e) {
      console.error(`❌ Error cargando plugin ${file}:`, e)
    }
  }
}
