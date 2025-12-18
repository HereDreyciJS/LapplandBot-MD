export default {
    command: ['ping'],
    execute: async ({ sock, m }) => {
        await sock.sendMessage(m.key.remoteJid, { text: 'Pong!' }, { quoted: m });
    }
};
