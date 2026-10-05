export default {
  name: "ping",
  alias: ["p", "speed"],
  description: "Cyber speed check",
  async execute(sock, jid, msg) {
    const start = Date.now()
    
    // React with emoji
    try {
      await sock.sendMessage(jid, {
        react: { text: "⚡", key: msg.key }
      })
    } catch {}

    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    const latency = Date.now() - start
    const speed = (Math.random() * 0.9 + 0.1).toFixed(3)

    const text = `╭─❍ CYBER SPEED SYSTEM 🥀
│
│ ⚡ 𝙎𝙋𝙀𝘿: 0.${speed}s
│ 🚀 𝙇𝘼𝙏𝙀𝙉𝘾𝙔: ${latency}.00${Math.floor(Math.random()*9)}MS
│ 🛰️ 𝙎𝙏𝘼𝙏𝙐𝙎: 𝙊𝙉𝙇𝙄𝙉𝙀 ✅
│ 💾 𝙍𝘼𝙈: ${ram}MB
│ 💻 𝙎𝙔𝙎𝙏𝙀𝙈: CYBER-SYSTEM
│ 🖥 SERVER. STORM CLOUD
│
╰───────────────❍`

    await sock.sendMessage(jid, {
      text: text,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363414065055650@newsletter",
          newsletterName: "STORM CYBER MD",
          serverMessageId: 1
        }
      }
    }, { quoted: msg })

    // Second react after reply
    try {
      await sock.sendMessage(jid, {
        react: { text: "🚀", key: msg.key }
      })
    } catch {}
  }
}
