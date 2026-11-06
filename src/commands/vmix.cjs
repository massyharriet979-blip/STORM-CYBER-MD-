export default {
  name: 'vmix',
  aliases: ['videomix', 'mixvideo'],
  ownerOnly: true,
  async execute(sock, from, msg) {
    try { await sock.sendMessage(from, { react: { text: '🎞️', key: msg.key } }) } catch {}

    const q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    // need 2 videos: current quoted + previous
    const ctx = msg.message?.extendedTextMessage?.contextInfo
    
    if (!ctx || !q || !q.videoMessage) {
      return await sock.sendMessage(from, {
        text: `╭─❍「 🎞️ ᴠᴍɪx 」─❍
│⚫ ʀᴇᴘʟʏ ᴛᴏ 2 ᴠɪᴅᴇᴏs
│⚫ sᴇɴᴅ ᴠɪᴅᴇᴏ 1
│⚫ ʀᴇᴘʟʏ ᴠɪᴅᴇᴏ 1 ᴡɪᴛʜ ᴠɪᴅᴇᴏ 2
│⚫ ᴛʜᴇɴ .vmix
│⚫ ɪᴛ ᴡɪʟ ᴍᴇʀɢᴇ ᴛʜᴇᴍ
╰─▭▭▭▭▭▭▭❍`
      }, { quoted: msg })
    }

    // For simple vmix we concat quoted + its quoted
    const quoted2 = q?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted2 || !quoted2.videoMessage) {
      return await sock.sendMessage(from, {
        text: `╭─❍「 ❌ ᴇʀʀᴏʀ 」─❍
│⚫ ɴᴇᴅ 2 ᴠɪᴅᴇᴏs
│⚫ ʀᴇᴘʟʏ ᴠɪᴅᴇᴏ 2 ᴛᴏ ᴠɪᴅᴇᴏ 1
│⚫ ᴛʜᴇɴ .vmix
╰─▭▭▭▭▭▭▭❍`
      }, { quoted: msg })
    }

    try {
      const stream1 = await sock.downloadMediaMessage({ message: quoted2 })
      const stream2 = await sock.downloadMediaMessage({ message: { message: q } })

      const { exec } = await import('child_process')
      const fs = await import('fs')
      const p1 = '/tmp/vmix1_' + Date.now() + '.mp4'
      const p2 = '/tmp/vmix2_' + Date.now() + '.mp4'
      const list = '/tmp/vmixlist_' + Date.now() + '.txt'
      const out = '/tmp/vmix_out_' + Date.now() + '.mp4'

      fs.writeFileSync(p1, stream1)
      fs.writeFileSync(p2, stream2)
      fs.writeFileSync(list, `file '${p1}'\nfile '${p2}'`)

      await new Promise((res, rej) => {
        exec(`ffmpeg -f concat -safe 0 -i ${list} -c copy ${out} -y`, (err) => {
          if (err) rej(err)
          else res()
        })
      })

      const outBuf = fs.readFileSync(out)

      await sock.sendMessage(from, {
        video: outBuf,
        caption: `╭─❍「 ✅ ᴠᴍɪx 」─❍\n╰─▭▭▭▭▭▭▭❍\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇ ᴄʏʙᴇʀ sᴇᴄᴜʀɪᴛʏ ʙᴏᴛ`
      }, { quoted: msg })

      try { await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }) } catch {}

      fs.unlinkSync(p1)
      fs.unlinkSync(p2)
      fs.unlinkSync(list)
      fs.unlinkSync(out)

    } catch (e) {
      try { await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }) } catch {}
      await sock.sendMessage(from, {
        text: `╭─❍「 ❌ ᴇʀʀᴏʀ 」─❍\n│⚫ ${e.message}\n╰─▭▭▭▭▭▭▭❍`
      }, { quoted: msg })
    }
  }
}
