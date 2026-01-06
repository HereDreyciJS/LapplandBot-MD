import fetch from "node-fetch"

export default {
  command: ["pin", "pinterest"],
  description: "Busca imágenes en Pinterest",

  execute: async ({ sock, m, args, command, prefix, isGroup }) => {
    try {
      if (!args.length) {
        return sock.sendMessage(
          m.chat,
          { text: `📌 Usa: ${prefix + command} <búsqueda>` },
          { quoted: m }
        )
      }

      const query = args.join(" ")
      const url = `https://api.ryzendesu.vip/api/pinterest?query=${encodeURIComponent(query)}`

      const res = await fetch(url, { timeout: 10000 })

      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        throw new Error("Respuesta no válida")
      }

      const json = await res.json()

      if (!json.status || !Array.isArray(json.result) || json.result.length === 0) {
        throw new Error("Sin resultados")
      }

      const image = json.result[Math.floor(Math.random() * json.result.length)]

      await sock.sendMessage(
        m.chat,
        {
          image: { url: image },
          caption: `📌 *Pinterest*\n🔎 ${query}`
        },
        { quoted: m }
      )

    } catch (err) {
      console.error("[PIN ERROR]", err)

      await sock.sendMessage(
        m.chat,
        { text: "❌ Pinterest no respondió correctamente, intenta otra vez" },
        { quoted: m }
      )
    }
  }
}
