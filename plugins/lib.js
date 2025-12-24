import { getLidInfo } from '../lib/utils/lid.js'

export default {
  command: ['debugjid'],
  description: 'Muestra el JID real y su versión normalizada',
  execute: async ({ sock, m }) => {
    const info = getLidInfo(m)

    const text =
      '✿ *Debug JID*\n' +
      `> RAW ⴵ ${info.rawJid}\n` +
      `> NORMALIZED ⴵ ${info.normalized}`

    await sock.sendMessage(
      m.key.remoteJid,
      { text },
      { quoted: m }
    )
  }
}
