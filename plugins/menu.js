import { plugins } from '../lib/plugins.js';

export default {
    command: ['menu', 'help'],
    execute: async ({ sock, m }) => {
        let menuText = 'Available Commands:\n\n';

        // Retrieve unique commands to avoid duplicates in display if multiple aliases exist
        const uniquePlugins = new Set(plugins.values());

        uniquePlugins.forEach(plugin => {
            const cmds = Array.isArray(plugin.command) ? plugin.command.join(', ') : plugin.command;
            menuText += `- /${cmds}\n`;
        });

        await sock.sendMessage(m.key.remoteJid, { text: menuText }, { quoted: m });
    }
};
