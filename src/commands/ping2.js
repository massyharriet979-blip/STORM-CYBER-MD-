export default {
  name: "ping2",
  alias: ["p2", "speed"],
  description: "ping2 small caps",
  async execute(sock, jid, msg) {
    const start = Date.now()
    
    // react first
    try {
      await sock.sendMessage(jid, { react: { text: "⚡", key: msg.key } })
    } catch {}

    const latency = Date.now() - start
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    const up = process.uptime()
    const h = Math.floor(up / 3600)
    const m = Math.floor((up % 3600) / 60)
    const s = Math.floor(up % 60)

    const text = `*ꜱᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ - ᴘɪɴɢ2*

┌──────────────
│ *⚡ sᴘᴇᴇᴅ:* ${latency} ms
│ *⏱️ ᴜᴘᴛɪᴍᴇ:* ${h}ʜ ${m}ᴍ ${s}s
│ *💾 ʀᴀᴍ:* ${ram} ᴍʙ
│ *📡 sᴛᴀᴛᴜs:* ᴀᴄᴛɪᴠᴇ
└──────────────

> *sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ*`

    await sock.sendMessage(jid, {
      text: text,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363414065055650@newsletter",
          newsletterName: "STORM CYBER MD",
          serverMessageId: 1
        },
        externalAdReply: {
          title: "STORM CYBER MD",
          body: "View Channel",
          thumbnailUrl: "https://i.imgur.com/8Km9tLL.jpg",
          sourceUrl: "https://whatsapp.com/channel/0029VbA6MSYJENy2A9I2vI0v",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: msg })

    // react after
    try {
      await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } })
    } catch {}
  }
}
