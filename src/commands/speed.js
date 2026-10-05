export default {
  name: "speed",
  alias: ["sp", "latency"],
  description: "storm cyber speed",
  async execute(sock, jid, msg) {
    const start = Date.now()

    // react first
    try {
      await sock.sendMessage(jid, { react: { text: "⚡", key: msg.key } })
    } catch {}

    const speed = Date.now() - start

    const text = `*ꜱᴛᴏʀᴍ ᴄʏʙᴇʀ ꜱᴘᴇᴇᴅ* ⚡
*ꜱᴘᴇᴇᴅ:* ${speed} ᴍꜱ
*ꜱᴛᴀᴛᴜꜱ:* ꜱᴜᴘᴇʀ ғᴀꜱᴛ 🥀

> ᴛʜᴀɴx ғᴏʀ ᴜꜱɪɴɢ ꜱᴛᴏʀᴍ x ʙᴏᴛ`

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

    try {
      await sock.sendMessage(jid, { react: { text: "🥀", key: msg.key } })
    } catch {}
  }
}
