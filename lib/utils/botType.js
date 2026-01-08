export function getBotType(sock) {
  const main = global.conn?.user?.jid
  const current = sock?.user?.jid

  if (!current) {
    return {
      isOriginal: false,
      isSub: false,
      type: 'desconocido'
    }
  }

  if (!main) {
    return {
      isOriginal: true,
      isSub: false,
      type: 'original'
    }
  }

  const isOriginal = main === current

  return {
    isOriginal,
    isSub: !isOriginal,
    type: isOriginal ? 'original' : 'sub'
  }
}
