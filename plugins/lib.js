import { getLidInfo } from '../lib/utils/lid.js'

export default {
  command: ['debugjid'],
  execute: async ({ sock, m }) => {
    const info = getLidInfo(m)

    await sock.sendMessage(
      m.key.remoteJid,
      {
        text:
          `RAW JID:\n${info.rawJid}\n\n` +
          `NORMALIZED:\n${info.normalized}`
      },
      { quoted: m }
    )
  }
}
