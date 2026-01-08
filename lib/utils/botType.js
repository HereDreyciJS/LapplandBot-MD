
export function getBotType(sock) {
  const mainJid = global.conn?.user?.jid
  const currentJid = sock?.user?.jid

  if (!mainJid || !currentJid) {
    return {
      isOriginal: false,
      isSub: false,
      type: 'desconocido'
    }
  }

  const isOriginal = mainJid === currentJid

  return {
    isOriginal,
    isSub: !isOriginal,
    type: isOriginal ? 'original' : 'sub'
  }
}
