export default {
  name: "alive",
  aliases: ["uptime", "bot", "status"],

  async execute(sock, m, args) {
    if (!m.chat) m.chat = m.key?.remoteJid || m.from || '';
    if (!m.pushName) m.pushName = m.pushName || 'User';
    if (!m.chat) m.chat = m.key?.remoteJid || m.from || '';
    if (!m.pushName) m.pushName = m.pushName || 'User';
    try {
      const push = m.pushName || "User"

      const sec = Math.floor(process.uptime())
      const h = Math.floor(sec / 3600)
      const mm = Math.floor((sec % 3600) / 60)
      const s = sec % 60

      const uptime = `${h}ʜ ${mm}ᴍ ${s}ꜱ`

      // React to command
      await sock.sendMessage(m.chat, {
        react: {
          text: "⚡",
          key: m.key
        }
      })

      const caption = `╭━━━〔 ⚡ 〕━━━╮
│
│ 🤖 ʙᴏᴛ: ꜱᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
│ 👑 ᴏᴡɴᴇʀ: ꜱᴛᴏʀᴍ x
│ 👤 ᴜꜱᴇʀ: @${push.replace(/@/g, "")}
│ ⏱️ ᴜᴘᴛɪᴍᴇ: ${uptime}
│ 🌐 ᴍᴏᴅᴇ: ᴘᴜʙʟɪᴄ
│ 🟢 ꜱᴛᴀᴛᴜꜱ: ғᴜʟʟʏ ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ
│ ⚙️ ꜱʏꜱᴛᴇᴍ: ʀᴜɴɴɪɴɢ
│
├━━━〔 ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ 〕━━━┤
│
│ ᴇɴɢɪɴᴇᴇʀᴇᴅ ғᴏʀ ꜱᴘᴇᴇᴅ.
│ ᴅᴇꜱɪɢɴᴇᴅ ғᴏʀ ᴘᴇʀғᴏʀᴍᴀɴᴄᴇ.
│ ʙᴜɪʟᴛ ᴛᴏ ᴋᴇᴇᴘ ɢʀᴏᴜᴘꜱ ᴜɴᴅᴇʀ ᴄᴏɴᴛʀᴏʟ.
│
├━━━〔 ꜱᴛᴏʀᴍ x 〕━━━┤
│
│ ᴛᴇᴄʜɴᴏʟᴏɢʏ ᴡɪᴛʜ ᴀ ᴠɪꜱɪᴏɴ.
│ ɪɴɴᴏᴠᴀᴛɪᴏɴ ᴡɪᴛʜᴏᴜᴛ ʟɪᴍɪᴛꜱ.
│ ᴛʜᴇ ꜱᴛᴏʀᴍ ɴᴇᴠᴇʀ ꜱʟᴇᴇᴘꜱ ⚡
│
│ ᴛᴇʟᴇɢʀᴀᴍ: https://t.me/STORMX666
╰━━━━━━━━━━━━━━━╯`

      await sock.sendMessage(
        m.chat,
        {
          text: caption,
          mentions: [m.sender]
        },
        { quoted: m }
      )

    } catch (e) {
      await sock.sendMessage(
        m.chat,
        { text: "❌ ᴀʟɪᴠᴇ ᴇʀʀᴏʀ: " + e.message },
        { quoted: m }
      )
    }
  }
}
