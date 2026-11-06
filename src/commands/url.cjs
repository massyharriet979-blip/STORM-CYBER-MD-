export default {
  name: 'url',
  aliases: ['tourl', 'upload'],
  ownerOnly: true,
  async execute(sock, from, msg) {
    try { await sock.sendMessage(from, { react: { text: '🔗', key: msg.key } }) } catch {}

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted || (!quoted.imageMessage &&!quoted.videoMessage &&!quoted.documentMessage)) {
      return await sock.sendMessage(from, {
        text: `╭─❍「 🔗 ᴜʀʟ 」─❍
│⚫ ʀᴇᴘʟʏ ᴛᴏ ɪᴍᴀɢᴇ/ᴠɪᴅᴇᴏ
╰─▭▭▭▭▭▭▭❍`
      }, { quoted: msg })
    }

    try {
      const stream = await sock.downloadMediaMessage({ message: quoted })
      const fs = await import('fs')
      const path = '/tmp/url_' + Date.now()
      fs.writeFileSync(path, stream)

      const formData = new FormData()
      const blob = new Blob([stream])
      formData.append('file', blob, 'file.jpg')

      const res = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      })
      const url = await res.text()

      await sock.sendMessage(from, {
        text: `╭─❍「 ✅ ᴜᴘʟᴏᴀᴅᴇᴅ 」─❍
│⚫ ʟɪɴᴋ: ${url}
╰─▭▭▭▭▭▭▭❍
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴄʏʙᴇʀ sᴇᴄᴜʀɪᴛʏ ʙᴏᴛ`
      }, { quoted: msg })

      try { await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }) } catch {}
      fs.unlinkSync(path)

    } catch (e) {
      try { await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }) } catch {}
      await sock.sendMessage(from, {
        text: `╭─❍「 ❌ ᴇʀʀᴏʀ 」─❍\n│⚫ ${e.message}\n╰─▭▭▭▭▭▭▭❍`
      }, { quoted: msg })
    }
  }
}
