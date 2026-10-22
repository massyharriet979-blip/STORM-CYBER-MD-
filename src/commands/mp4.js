export default {
  name: 'mp4',
  aliases: ['tomp4', 'sticker2mp4'],
  ownerOnly: true,
  async execute(sock, from, msg) {
    try { await sock.sendMessage(from, { react: { text: '🎬', key: msg.key } }) } catch {}

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted || !quoted.stickerMessage) {
      return await sock.sendMessage(from, {
        text: `╭─❍「 🎬 ᴍᴘ𝟺 」─❍
│⚫ ʀᴇᴘʟʏ ᴛᴏ sᴛɪᴄᴋᴇʀ
╰─▭▭▭▭▭▭▭❍`
      }, { quoted: msg })
    }

    try {
      const stream = await sock.downloadMediaMessage({ message: quoted })

      const { exec } = await import('child_process')
      const fs = await import('fs')
      const path = '/tmp/mp4_' + Date.now() + '.webp'
      const out = '/tmp/mp4_out_' + Date.now() + '.mp4'

      fs.writeFileSync(path, stream)

      await new Promise((res, rej) => {
        exec(`ffmpeg -i ${path} -vf "scale=512:512:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -movflags +faststart ${out} -y`, (err) => {
          if (err) rej(err)
          else res()
        })
      })

      const outBuf = fs.readFileSync(out)

      await sock.sendMessage(from, {
        video: outBuf,
        caption: `╭─❍「 ✅ ᴍᴘ𝟺 」─❍\n╰─▭▭▭▭▭▭▭❍\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴄʏʙᴇʀ sᴇᴄᴜʀɪᴛʏ ʙᴏᴛ`
      }, { quoted: msg })

      try { await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }) } catch {}

      fs.unlinkSync(path)
      fs.unlinkSync(out)

    } catch (e) {
      try { await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }) } catch {}
      await sock.sendMessage(from, {
        text: `╭─❍「 ❌ ᴇʀʀᴏʀ 」─❍\n│⚫ ${e.message}\n╰─▭▭▭▭▭▭▭❍`
      }, { quoted: msg })
    }
  }
}
