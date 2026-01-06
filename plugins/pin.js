import fetch from 'node-fetch'

export default {
  command: ['pin', 'pinterest'],
  execute: async ({ sock, m, text }) => {
    try {
      if (!text) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '📌 Usa:\n/pin aesthetic' },
          { quoted: m }
        )
      }

      const url = `https://pinterest-api.vercel.app/?q=${encodeURIComponent(text)}`
      const res = await fetch(url)

      const body = await res.text()

      let data
      try {
        data = JSON.parse(body)
      } catch {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ Pinterest no respondió correctamente. Intenta otra vez.' },
          { quoted: m }
        )
      }

      if (!Array.isArray(data) || data.length === 0) {
        return sock.sendMessage(
          m.key.remoteJid,
          { text: '❌ No encontré imágenes.' },
          { quoted: m }
        )
      }

      const img = data[Math.floor(Math.random() * data.length)]

      await sock.sendMessage(
        m.key.remoteJid,
        {
          image: { url: img },
          caption: `📌 *Pinterest*\n🔎 ${text}`
        },
        { quoted: m }
      )

    } catch (err) {
      console.error('PIN ERROR:', err)
      await sock.sendMessage(
        m.key.remoteJid,
        { text: '⚠️ Error inesperado en /pin.' },
        { quoted: m }
      )
    }
  }
}
