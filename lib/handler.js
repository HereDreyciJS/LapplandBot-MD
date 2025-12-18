import { plugins } from './plugins.js';

export const handler = async (sock, m) => {
    try {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const type = Object.keys(msg.message)[0];
        const body = (type === 'conversation') ? msg.message.conversation :
            (type === 'imageMessage') ? msg.message.imageMessage.caption :
                (type === 'videoMessage') ? msg.message.videoMessage.caption :
                    (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';

        const prefix = '/';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(" ");

        if (isCmd) {
            const plugin = plugins.get(command);
            if (plugin) {
                await plugin.execute({ sock, m: msg, args, text, width: prefix + command });
            } else {
                console.log(`Command not found: ${command}`);
            }
        }
    } catch (e) {
        console.error('Error in handler:', e);
    }
};
