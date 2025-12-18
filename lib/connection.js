import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';

export const startConnection = async (startBot) => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) ?
                lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut : true;
            
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            
            if (shouldReconnect) {
                startConnection(startBot);
            }
        } else if (connection === 'open') {
            console.log('opened connection');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
};
