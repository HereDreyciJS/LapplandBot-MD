export function getBotType(sock) {
  try {
    if (!sock || !sock.user) {
      return { type: 'unknown' }
    }

    if (global.conn && global.conn === sock) {
      return { type: 'main' }
    }

    if (global.conn && global.conn !== sock) {
      return { type: 'sub' }
    }

    return { type: 'unknown' }
  } catch {
    return { type: 'unknown' }
  }
}
