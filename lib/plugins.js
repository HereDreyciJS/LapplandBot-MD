import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginsDir = path.join(__dirname, '../plugins')

global.plugins = new Map()

async function loadDir(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      await loadDir(fullPath)
      continue
    }

    if (!file.endsWith('.js')) continue

    try {
      const fileUrl = pathToFileURL(fullPath).href
      const mod = await import(`${fileUrl}?update=${Date.now()}`)
      const plugin = mod.default

      if (
        !plugin ||
        !plugin.command ||
        typeof plugin.execute !== 'function'
      ) {
        console.warn(`⚠️ Plugin inválido: ${fullPath}`)
        continue
      }

      const commands = Array.isArray(plugin.command)
        ? plugin.command
        : [plugin.command]

      for (const cmd of commands) {
        if (global.plugins.has(cmd)) {
          console.warn(`⚠️ Comando duplicado "${cmd}" en ${fullPath}`)
        }
        global.plugins.set(cmd, plugin)
      }

      console.log(`✅ Plugin cargado: ${fullPath.replace(pluginsDir, '')}`)
    } catch (e) {
      console.error(`❌ Error cargando plugin ${fullPath}:`, e)
    }
  }
}

export const loadPlugins = async () => {
  global.plugins.clear()

  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true })
  }

  await loadDir(pluginsDir)
}
