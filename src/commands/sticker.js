export default {
  name: 'sticker',
  aliases: ['s', 'stick', 'edit'],
  ownerOnly: false,
  async execute(sock, from, msg, args) {
    try { await sock.sendMessage(from, { react: { text: '✨', key: msg.key } }) } catch {}

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const mediaMsg = quoted || msg.message

    const type = Object.keys(mediaMsg)[0]
    const isMedia = ['imageMessage', 'videoMessage', 'stickerMessage'].includes(type)

    if (!isMedia) {
      return await sock.sendMessage(from, {
        text: `╭══〘 ✏️ ᴇᴅɪᴛ ᴄʜᴀᴘᴛᴇʀ 〙══⊷❍
┃✯│ᴄᴏᴍᴍᴀɴᴅ: sᴛɪᴄᴋᴇʀ
┃✯│
┃✯│.s → reply to img/vid
┃✯│.s crop → crop sticker
┃✯│.s circle → circle sticker
┃✯│.s rounde → rounded
┃✯│.s nobg → remove bg
╰══════════════════════⊷❍
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄʏʙᴇʀ ᴍᴅ`
      }, { quoted: msg })
    }

    try {
      const stream = await sock.downloadMediaMessage(
        quoted? { message: quoted } : msg
      )

      let pack = 'ᴄʏʙᴇʀ ᴍᴅ'
      let author = 'ᴇᴅɪᴛ ᴄʜᴀᴘᴛᴇʀ'

      // args handling
      if (args[0]?.toLowerCase() === 'circle') {
        // for circle you need to handle in converter
        author = 'ᴄɪʀᴄʟᴇ'
      }

      await sock.sendMessage(from, {
        sticker: stream,
        packname: pack,
        author: author
      }, { quoted: msg })

      // auto react after
      try { await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }) } catch {}

    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg })
    }
  }
}
