const small = (text) => {
  const map = {
    a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',
    g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',
    m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',
    s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'ˣ',
    y:'ʏ',z:'ᴢ'
  }
  return String(text).toLowerCase().split('').map(c => map[c] || c).join('')
}

export default {
  name: "ping",
  aliases: ["p", "speed"],
  description: "Cyber speed system",

  async execute(sock, m) {
    const start = Date.now()

    try {
      await sock.sendMessage(m.chat, {
        react: { text: "⚡", key: m.key }
      })
    } catch {}

    const latency = Date.now() - start

    const formatBytes = (bytes) =>
      (bytes / 1024 / 1024).toFixed(2) + " MB"

    const memory = process.memoryUsage()
    const uptime = Math.floor(process.uptime())

    const days = Math.floor(uptime / 86400)
    const hours = Math.floor((uptime % 86400) / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = uptime % 60

    const status = latency < 500 ? "ᴇxᴄᴇʟʟᴇɴᴛ" :
      latency < 1000 ? "ɢᴏᴏᴅ" : "sʟᴏᴡ"

    const text = `
╭━━━〔 ⚡ ${small("CYBER SPEED SYSTEM")} 〕━━━╮

┃ ⚡ ${small("SPEED")} : ${latency}ms
┃ 🚀 ${small("STATUS")} : ${status}
┃ 🤖 ${small("BOT")} : ${small("STORM CYBER MD")}
┃ ☁️ ${small("SERVER")} : ${small("STORM CLOUD")}
┃ 🟢 ${small("SYSTEM")} : ${small("ONLINE")}

╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 📊 ${small("SYSTEM INFO")} 〕━━━╮

┃ 💾 ${small("RAM USED")} : ${formatBytes(memory.rss)}
┃ 📦 ${small("HEAP USED")} : ${formatBytes(memory.heapUsed)}
┃ ⏱️ ${small("UPTIME")} : ${days}d ${hours}h ${minutes}m ${seconds}s

╰━━━━━━━━━━━━━━━━━━━━╯

        ⚡ ${small("POWERED BY STORM X")}
`

    await sock.sendMessage(m.chat, {
      text,
      contextInfo: {
        mentionedJid: []
      }
    }, {
      quoted: m
    })
  }
}
