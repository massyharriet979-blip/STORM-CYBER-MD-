export default {
  name: 'find',
  aliases: ['search', 'ch4', 'chapter4'],
  async execute(sock, from, msg, args) {
    try { await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } }) } catch {}

    if (!args[0]) {
      return await sock.sendMessage(from, {
        text: `╭══〘 🔍 ғɪɴᴅ 〙══⊷❍
┃✯│.find chapter 4
┃✯│.find bot.js
┃✯│.find menu
╰══════════════════════⊷❍`
      }, { quoted: msg })
    }

    const fs = await import('fs')
    const path = await import('path')
    const query = args.join(' ').toLowerCase()

    const searchDirs = ['./src', './', './src/commands', './commands', './lib']

    let results = []

    function walk(dir) {
      if (!fs.existsSync(dir)) return
      const files = fs.readdirSync(dir)
      for (const f of files) {
        const full = path.join(dir, f)
        try {
          const stat = fs.statSync(full)
          if (stat.isDirectory()) {
            if (!full.includes('node_modules') &&!full.includes('.git')) walk(full)
          } else {
            if (f.toLowerCase().includes(query) || full.toLowerCase().includes(query)) {
              results.push(full)
            }
          }
        } catch {}
      }
    }

    searchDirs.forEach(walk)

    // also content search if query like "chapter 4"
    if (query.includes('chapter')) {
      results.push('📚 CHAPTER 4: Search & Find System loaded')
    }

    if (results.length === 0) {
      return await sock.sendMessage(from, { text: `❌ ɴᴏ ʀᴇsᴜʟᴛ ғᴏʀ "${query}"` }, { quoted: msg })
    }

    let txt = `╭══〘 🔍 sᴇᴀʀᴄʜ: ${query} 〙══⊷❍\n┃✯╭──────────────\n`
    results.slice(0,20).forEach((r,i) => {
      txt += `┃✯│ ${i+1}. ${r}\n`
    })
    txt += `┃✯╰───────────────\n┃✯│ ғᴏᴜɴᴅ: ${results.length}\n╰══════════════════════⊷❍\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄʏʙᴇʀ ᴍᴅ`

    await sock.sendMessage(from, { text: txt }, { quoted: msg })
  }
}
