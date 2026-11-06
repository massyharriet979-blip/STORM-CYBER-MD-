export default {
  name: 'vv',
  alias: ['viewonce', 'disclose'],
  execute: async (sock, jid, msg) => {
    try {
      await sock.sendMessage(jid, { react: { text: '👀', key: msg.key } })

      const isOwner = msg.key.fromMe
      if (!isOwner) {
        return await sock.sendMessage(jid, {
          text: `*ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴛᴏᴛᴀʟʟʏ ʀᴇsᴛʀɪᴄᴛᴇᴅ ᴛᴏ ᴜsᴇʀs, ғᴏʀ ᴏᴡɴᴇʀ ᴏɴʟʏ*`
        }, { quoted: msg })
      }

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      if (!quoted) {
        return await sock.sendMessage(jid, {
          text: `*❌ ǫᴜᴀɴᴛᴜᴍ ᴇɴᴛᴀɴɢʟᴇᴍᴇɴᴛ ғᴀɪʟᴇᴅ - ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴘʜᴏᴛᴏɴ*\n\n> \`ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x\``
        }, { quoted: msg })
      }

      const viewOnce = quoted.viewOnceMessageV2?.message || quoted.viewOnceMessage?.message || quoted
      const img = viewOnce?.imageMessage
      const vid = viewOnce?.videoMessage

      if (!img && !vid) {
        return await sock.sendMessage(jid, {
          text: `*❌ ɴᴏ ᴘʜᴏᴛᴏɴɪᴄ ᴅᴀᴛᴀ ᴅᴇᴛᴇᴄᴛᴇᴅ ɪɴ ǫᴜᴀɴᴛᴜᴍ ғɪᴇʟᴅ*\n\n> \`ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x\``
        }, { quoted: msg })
      }

      await sock.sendMessage(jid, {
        text: `*🔬 ɪɴɪᴛɪᴀᴛɪɴɢ ᴘʜᴏᴛᴏɴɪᴄ ᴅᴇᴄᴏᴍᴘᴏsɪᴛɪᴏɴ*\n*🧬 ᴀɴᴀʟʏᴢɪɴɢ ᴇɴᴄʀʏᴘᴛᴇᴅ ʟɪɢʜᴛ ᴡᴀᴠᴇs*\n*⚗️ ʀᴇᴠᴇʀsɪɴɢ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴇɴᴛʀᴏᴘʏ*`
      }, { quoted: msg })

      const buffer = await sock.downloadMediaMessage({ message: viewOnce })

      if (img) {
        await sock.sendMessage(jid, {
          image: buffer,
          caption: `*✅ ǫᴜᴀɴᴛᴜᴍ ᴅɪsᴄʟᴏsᴜʀᴇ ᴄᴏᴍᴘʟᴇᴛᴇ*\n*🔬 ᴘʜᴏᴛᴏɴ ᴍᴀᴛʀɪx ᴅᴇᴄᴏᴅᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ*\n\n> \`ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x\``
        }, { quoted: msg })
      } else {
        await sock.sendMessage(jid, {
          video: buffer,
          caption: `*✅ ᴋɪɴᴇᴛɪᴄ ᴅɪsᴄʟᴏsᴜʀᴇ ᴄᴏᴍᴘʟᴇᴛᴇ*\n*🧬 ᴍᴏᴛɪᴏɴ ᴠᴇᴄᴛᴏʀ ᴀɴᴀʟʏsɪs ᴅᴏɴᴇ*\n\n> \`ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x\``
        }, { quoted: msg })
      }

    } catch (e) {
      await sock.sendMessage(jid, { text: `*❌ ʟᴀʙ ᴇʀʀᴏʀ:* ${e.message}\n> \`ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x\`` }, { quoted: msg })
    }
  }
}
