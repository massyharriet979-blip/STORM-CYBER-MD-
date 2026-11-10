export default {
  name: 'compress',
  aliases: ['cpress', 'low'],
  ownerOnly: true,
  async execute(sock, from, msg) {
    try { await sock.sendMessage(from, { react: { text: '🗜️', key: msg.key } }) } catch {}

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
      return await sock.sendMessage(from, {
        text: `╭══〘 🗜️ ᴄᴏᴍᴘʀᴇss 〙══⊷❍
┃✯│ʀᴇᴘʟʏ ᴛᴏ ɪᴍᴀɢᴇ/ᴠɪᴅᴇᴏ
╰══════════════════════⊷❍`
      }, { quoted: msg })
    }

    try {
      const stream = await sock.downloadMediaMessage({ message: quoted })

      const { exec } = await import('child_process')
      const fs = await import('fs')
      const isVid = !!quoted.videoMessage
      const path = '/tmp/comp_' + Date.now() + (isVid ? '.mp4' : '.jpg')
      const out = '/tmp/comp_out_' + Date.now() + (isVid ? '.mp4' : '.jpg')

      fs.writeFileSync(path, stream)

      await new Promise((res, rej) => {
        let cmd = isVid
          ? `ffmpeg -i ${path} -vcodec libx264 -crf 28 -preset veryfast ${out}`
          : `ffmpeg -i ${path} -q:v 10 ${out}`
        exec(cmd, (err) => {
          if (err) rej(err)
          else res()
        })
      })

      const outBuf = fs.readFileSync(out)

      if (isVid) {
        await sock.sendMessage(from, {
          video: outBuf,
          caption: `╭══〘 ✅ ᴄᴏᴍᴘʀᴇssᴇᴅ 〙══⊷❍\n╰══════════════════════⊷❍\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴄʏʙᴇʀ sᴇᴄᴜʀɪᴛʏ ʙᴏᴛ`
        }, { quoted: msg })
      } else {
        await sock.sendMessage(from, {
          image: outBuf,
          caption: `╭══〘 ✅ ᴄᴏᴍᴘʀᴇssᴇᴅ 〙══⊷❍\n╰══════════════════════⊷❍\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴄʏʙᴇʀ sᴇᴄᴜʀɪᴛʏ ʙᴏᴛ`
        }, { quoted: msg })
      }

      try { await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }) } catch {}

      fs.unlinkSync(path)
      fs.unlinkSync(out)

    } catch (e) {
      try { await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }) } catch {}
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg })
    }
  }
}
