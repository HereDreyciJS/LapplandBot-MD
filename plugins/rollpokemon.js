// Creaditos @Neykoor no borrar 
// repositorio del dev: https://github.com/ScriptNex

import fs from 'fs'
import { media } from '../lib/utils/media.js'

const chances = [
  { rarity: 'common', weight: 60 },
  { rarity: 'rare', weight: 25 },
  { rarity: 'epic', weight: 10 },
  { rarity: 'legendary', weight: 4 },
  { rarity: 'mythical', weight: 1 }
]

const pickRarity = () => {
  const roll = Math.random() * 100
  let acc = 0
  for (const r of chances) {
    acc += r.weight
    if (roll <= acc) return r.rarity
  }
  return 'common'
}

export default {
  command: ['rollpokemon', 'rp'],
  description: 'Sorteo Pokémon público',

  execute: async ({ sock, m }) => {
    const list = JSON.parse(fs.readFileSync('./lib/pokemon.json', 'utf-8'))

    const rarity = pickRarity()
    const pool = list.filter(p => p.rarity === rarity)
    const pokemon = pool[Math.floor(Math.random() * pool.length)]

    const img = media(`pokemon/${rarity}/${pokemon.image}.png`)

    const text =
`┏━ *Pokémon Roll* ━⊜
┃✦ *Nombre* :: ${pokemon.name}
┃✧ *Rareza* :: ${rarity.toUpperCase()}
┗━━◘`

    await sock.sendMessage(
      m.key.remoteJid,
      img
        ? { image: { url: img }, caption: text }
        : { text },
      { quoted: m }
    )
  }
}
