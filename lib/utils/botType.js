export function getBotType(sock) {
  if (!sock) return 'desconocido'

  if (sock.isMainBot === true) return 'original'
  if (sock.isSubBot === true) return 'sub'

  return 'desconocido'
}
