export function getLidInfo(m) {
  const isGroup = m.key.remoteJid.endsWith('@g.us')

  const rawJid = isGroup
    ? m.key.participant
    : m.key.remoteJid

  const normalized = rawJid.replace(/\D/g, '')

  return {
    rawJid,
    normalized
  }
}
