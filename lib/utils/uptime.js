export function getUptime() {
  const ms = process.uptime() * 1000

  const s = Math.floor(ms / 1000) % 60
  const m = Math.floor(ms / 60000) % 60
  const h = Math.floor(ms / 3600000) % 24
  const d = Math.floor(ms / 86400000)

  return [
    d && `${d}d`,
    h && `${h}h`,
    m && `${m}m`,
    `${s}s`
  ].filter(Boolean).join(' ')
}
