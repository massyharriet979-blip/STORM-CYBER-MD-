export default {
  name: "ping",
  aliases: ["p"],
  description: "Cyber speed system",

  async execute(sock, m) {
    const start = Date.now()

    try {
      await sock.sendMessage(m.chat, {
        react: { text: "⚡", key: m.key }
      })

      const test = await sock.sendMessage(m.chat, {
        text: "⚡ Calculating cyber speed..."
      }, { quoted: m })

      const latency = Date.now() - start
      const uptime = process.uptime()
      const seconds = Math.floor(uptime % 60)
      const minutes = Math.floor((uptime / 60) % 60)
      const hours = Math.floor((uptime / 3600) % 24)
      const days = Math.floor(uptime / 86400)

      const text = `
╭━━━〔 ⚡ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 〕━━━╮
│
│  ⚡ 𝐏𝐈𝐍𝐆: ${latency} ms
│  🚀 𝐒𝐏𝐄𝐄𝐃: ${latency < 500 ? "FAST" : latency < 1000 ? "NORMAL" : "SLOW"}
│
│  🤖 𝐁𝐎𝐓: STORM CYBER MD
│  🟢 𝐒𝐓𝐀𝐓𝐔𝐒: ONLINE
│  ⚙️ 𝐒𝐘𝐒𝐓𝐄𝐌: ACTIVE
│
│  ⏱️ 𝐔𝐏𝐓𝐈𝐌𝐄:
│  ${days}d ${hours}h ${minutes}m ${seconds}s
│
│  👑 𝐃𝐄𝐕: STORM X
│  🌍 𝐍𝐄𝐓𝐖𝐎𝐑𝐊: CONNECTED
│
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
      `

      await sock.sendMessage(m.chat, {
        text,
        edit: test.key
      })
    } catch (err) {
      console.error("[PING ERROR]", err)
      await sock.sendMessage(m.chat, {
        text: "❌ PING CHECK FAILED. TRY AGAIN."
      }, { quoted: m })
    }
  }
}
