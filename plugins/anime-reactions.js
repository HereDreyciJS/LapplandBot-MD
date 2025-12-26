import fetch from 'node-fetch';

async function handleAnimeCommand(sock, m, command, remoteJid) {
    const categories = ['hug', 'pat', 'slap', 'bully', 'cuddle', 'cry', 'kiss', 'smile'];
    const action = command.replace('!', '').split(' ')[0].toLowerCase();

    if (!categories.includes(action)) return;

    try {
        const response = await fetch(`https://api.waifu.pics/sfw/${action}`);
        const data = await response.json();
        
        const mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const sender = m.key.participant || m.key.remoteJid;
        
        let text = `✨ ¡Reacción de ${action}!`;
        
        if (mentionedJid) {
            text = `@${sender.split('@')[0]} le dio un ${action} a @${mentionedJid.split('@')[0]}`;
        }

        await sock.sendMessage(remoteJid, { 
            video: { url: data.url }, 
            caption: text,
            gifPlayback: true,
            mentions: [sender, mentionedJid].filter(Boolean)
        });
    } catch (e) {
        console.error(e);
    }
}

// Dentro de tu evento upsert:
sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const remoteJid = m.key.remoteJid;
    const messageText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";

    if (messageText.startsWith('!')) {
        await handleAnimeCommand(sock, m, messageText, remoteJid);
    }
});
