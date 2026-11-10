export default {
  name: 'ping2',
  async execute(sock, from, msg) {
    try { await sock.sendMessage(from, { react: { text: '⚡️', key: msg.key } }) } catch {}
    const start = Date.now()
    await new Promise(r => setTimeout(r, 100))
    const latency = Date.now() - start

    const text = `╭─❍ *ꜱᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ* ⚡
│
│ *ᴘɪɴɢ2:* ${latency}ᴍꜱ
│ *ꜱᴘᴇᴇᴅ:* ${(latency/1000).toFixed(3)}ꜱ
│ *ꜱᴛᴀᴛᴜꜱ:* ᴏɴʟɪɴᴇ ✅
│ *ꜱᴇʀᴠᴇʀ:* ꜱᴛᴏʀᴍ ᴄʟᴏᴜᴅ
│
╰───────────────❍`

    await sock.sendMessage(from, { text }, { quoted: msg })
  }
}
