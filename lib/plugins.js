export const loadPlugins = async () => {
  plugins.clear()

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
        if (plugins.has(cmd)) {
          console.warn(`⚠️ Comando duplicado: ${cmd}`)
        }
        plugins.set(cmd, plugin)
      }

      console.log(`Loaded plugin: ${file}`)
    } catch (e) {
      console.error(`Error loading plugin ${file}:`, e)
    }
  }
}
