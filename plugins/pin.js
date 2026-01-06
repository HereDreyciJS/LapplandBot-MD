import fetch from "node-fetch"

export default {
  name: "pin",
  command: ["pin", "pinterest"],

  async handler(m, { sock, args }) {
    try {
      if (!args[0]) {
        return sock.sendMessage(m.chat, {
          text: "✏️ Usa: /pin <búsqueda>"
        }, { quoted: m })
      }

      const query = args.join(" ")
      const url = `https://api.ryzendesu.vip/api/pinterest?query=${encodeURIComponent(query)}`

      const res = await fetch(url, { timeout: 10000 })

      const ct = res.headers.get("content-type") || ""
      if (!ct.includes("application/json")) {
        throw new Error("Respuesta no JSON")
      }

      const data = await res.json()

      if (!data.status || !Array.isArray(data.result) || data.result.length === 0) {
        throw new Error("Sin resultados")
      }

      const img = data.result[Math.floor(Math.random() * data.result.length)]

      await sock.sendMessage(m.chat, {
        image: { url: img },
        caption: `📌 Pinterest\n🔎 ${query}`
      }, { quoted: m })

    } catch (err) {
      console.error("[PIN ERROR]", err.message)

      await sock.sendMessage(m.chat, {
        text: "❌ Pinterest no respondió correctamente, intenta otra vez"
      }, { quoted: m })
    }
  }
}
