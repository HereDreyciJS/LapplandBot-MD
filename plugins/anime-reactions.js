import fetch from 'node-fetch'

let handler = async (m, { conn, command, usedPrefix }) => {
    const categories = ['hug', 'pat', 'slap', 'bully', 'cuddle', 'cry', 'kiss', 'smile', 'waifu', 'neko', 'kick', 'happy']
    const action = command.toLowerCase()

    try {
        const response = await fetch(`https://api.waifu.pics/sfw/${action}`)
        if (!response.ok) return
        const data = await response.json()
        
        const quotedMsg = m.quoted ? m.quoted.sender : null
        const mentionedJid = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null
        const target = mentionedJid || quotedMsg
        const sender = m.sender
        
        let text = `✨ ${usedPrefix}${action}`
        
        if (target) {
            text = `@${sender.split('@')[0]} le dio un ${action} a @${target.split('@')[0]}`
        }

        await conn.sendMessage(m.chat, { 
            video: { url: data.url }, 
            caption: text,
            gifPlayback: true,
            mentions: [sender, target].filter(Boolean)
        }, { quoted: m })

    } catch (e) {
        console.error(e)
    }
}

handler.help = ['hug', 'pat', 'slap', 'bully', 'cuddle', 'cry', 'kiss', 'smile', 'kick']
handler.tags = ['anime']
handler.command = /^(hug|pat|slap|bully|cuddle|cry|kiss|smile|kick)$/i

export default handler
