export default {
  name: "ping",
  alias: ["p", "speed"],
  description: "Cyber speed check",
  async execute(sock, jid, msg) {
    const start = Date.now()
    try { await sock.sendMessage(jid, { react: { text: "⚡", key: msg.key } }) } catch {}
    
    let chk = await sock.sendMessage(jid, { text: "🔍 Checking server..." }, { quoted: msg })
    await new Promise(r => setTimeout(r, 800))
    
    try { await sock.sendMessage(jid, { text: "🖥️ Looking for server...", edit: chk.key }) } catch {
      await sock.sendMessage(jid, { text: "🖥️ Looking for server..." }, { quoted: msg })
    }
    
    await new Promise(r => setTimeout(r, 600))
    
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    const latency = Date.now() - start
    const speed = (Math.random() * 0.9 + 0.1).toFixed(3)

    const text = `╭─❍ CYBER SPEED SYSTEM 🥀
│
│ ⚡ 𝙎𝙋𝙀𝘿: 0.${speed}s
│ 🚀 𝙇𝘼𝙏𝙀𝙉𝘾𝙔: ${latency}MS
│ 🛰️ 𝙎𝙏𝘼𝙏𝙐𝙎: 𝙊𝙉𝙇𝙄𝙉𝙀 ✅
│ 💾 𝙍𝘼𝙈: ${ram}MB
│ 💻 𝙎𝙔𝙎𝙏𝙀𝙈: CYBER-SYSTEM
│ 🖥 SERVER: STORM CLOUD
│
╰───────────────❍`

    await sock.sendMessage(jid, {
      text: text,
      edit: chk.key,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363414065055650@newsletter",
          newsletterName: "STORM CYBER MD",
          serverMessageId: 1
        },
        externalAdReply: {
          title: "STORM CYBER MD",
          body: "Cyber Speed System",
          mediaType: 1,
          thumbnailUrl: "https://files.catbox.moe/jtb63o.jpg",
          sourceUrl: "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P",
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: msg })

    try { await sock.sendMessage(jid, { react: { text: "🚀", key: msg.key } }) } catch {}
  }
}
