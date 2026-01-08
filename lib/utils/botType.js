export function getBotType(sock) {
  const mainJid = global.conn?.user?.jid
  const currentJid = sock?.user?.jid

  if (!mainJid || !currentJid) {
    return {
      isMain: false,
      isSub: false,
      type: 'unknown'
    }
  }

  const isMain = mainJid === currentJid

  return {
    isMain,
    isSub: !isMain,
    type: isMain ? 'main' : 'sub'
  }
}
