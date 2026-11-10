export default {
  name: 'resize',
  aliases: ['resizeimg', 'rsize'],
  ownerOnly: true,
  async execute(sock, from, msg, args) {
    try { await sock.sendMessage(from, { react: { text: '📐', key: msg.key } }) } catch {}

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted ||!quoted.imageMessage) {
      return await sock.sendMessage(from, {
        text: `╭══〘 📐 ʀᴇsɪᴢᴇ 〙══⊷❍
┃✯│ʀᴇᴘʟʏ ᴛᴏ ɪᴍᴀɢᴇ
┃✯│.resize 500,500
┃✯│.resize 640,480
╰══════════════════════⊷❍`
      }, { quoted: msg })
    }

    if (!args[0]) {
      return await sock.sendMessage(from, { text: `❌ ᴇx:.resize 500,500` }, { quoted: msg })
    }

    let [w, h] = args[0].split(',').map(x => parseInt(x))
    if (!w ||!h) {
      w = 512
      h = 512
    }

    try {
      const stream = await sock.downloadMediaMessage({ message: quoted })

      const { exec } = await import('child_process')
      const fs = await import('fs')
      const path = '/tmp/rs_' + Date.now() + '.jpg'
      const out = '/tmp/rs_out_' + Date.now() + '.jpg'

      fs.writeFileSync(path, stream)

      await new Promise((res, rej) => {
        exec(`ffmpeg -i ${path} -vf "scale=${w}:${h}" ${out}`, (err) => {
          if (err) rej(err)
          else res()
        })
      })

      const outBuf = fs.readFileSync(out)

      await sock.sendMessage(from, {
        image: outBuf,
        caption: `╭══〘 ✅ ʀᴇsɪᴢᴇᴅ 〙══⊷❍\n┃✯│sɪᴢᴇ: ${w}x${h}\n╰══════════════════════⊷❍\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄʏʙᴇʀ ᴍᴅ`
      }, { quoted: msg })

      try { await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }) } catch {}

      fs.unlinkSync(path)
      fs.unlinkSync(out)

    } catch (e) {
      try { await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }) } catch {}
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg })
    }
  }
}
