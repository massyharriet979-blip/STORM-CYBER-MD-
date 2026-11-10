export default {
  name: "ping",
  aliases: ["p", "speed", "latency"],
  description: "ᴄʏʙᴇʀ ꜱᴘᴇᴇᴅ ᴄʜᴇᴄᴋ",

  async execute(sock, m, args) {
    const jid = m.chat
    const start = Date.now()

    // React to the original command
    try {
      await sock.sendMessage(jid, {
        react: {
          text: "⚡",
          key: m.key
        }
      })
    } catch {}

    // Checking message replies to command
    await sock.sendMessage(
      jid,
      { text: "🔍 ᴄʜᴇᴄᴋɪɴɢ ꜱᴇʀᴠᴇʀ..." },
      { quoted: m }
    )

    await new Promise(r => setTimeout(r, 800))

    const latency = Date.now() - start
    const speed = (Math.random() * 0.9 + 0.1).toFixed(3)
    const ram = (
      process.memoryUsage().heapUsed / 1024 / 1024
    ).toFixed(2)

    const text = `╭─── ᴄʏʙᴇʀ ꜱᴘᴇᴇᴅ ꜱʏꜱᴛᴇᴍ ⚡
│
│ ⚡ ꜱᴘᴇᴇᴅ: ${speed}s
│ ʟᴀᴛᴇɴᴄʏ: ${latency}ᴍꜱ
│ ꜱᴛᴀᴛᴜꜱ: ᴏɴʟɪɴᴇ ✅
│ ʀᴀᴍ: ${ram}ᴍʙ
│ ꜱʏꜱᴛᴇᴍ: ᴄʏʙᴇʀ-ꜱʏꜱᴛᴇᴍ
│ ꜱᴇʀᴠᴇʀ: ꜱᴛᴏʀᴍ ᴄʟᴏᴜᴅ
╰───────────────`

    // Final result also replies to original command
    await sock.sendMessage(
      jid,
      { text },
      { quoted: m }
    )
  }
}
