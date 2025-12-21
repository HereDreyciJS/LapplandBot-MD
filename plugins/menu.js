export default {
  command: ['menu', 'help'],
  execute: async ({ sock, m }) => {
    let menuText = 'Available Commands:\n\n'

    const uniquePlugins = new Set(global.plugins.values())

    for (const plugin of uniquePlugins) {
      const cmds = Array.isArray(plugin.command)
        ? plugin.command.join(', ')
        : plugin.command

      menuText += `- /${cmds}\n`
    }

    await sock.sendMessage(
      m.key.remoteJid,
      { text: menuText },
      { quoted: m }
    )
  }
}
