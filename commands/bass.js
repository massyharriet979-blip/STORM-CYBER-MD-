export default {
  name: 'bass',
  aliases: ['bassboost', 'deep'],
  ownerOnly: true,
  async execute(sock, from, msg) {
    try { await sock.sendMessage(from, { react: { text: '🔊', key: msg.key } }) } catch {}

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted) {
      return await sock.sendMessage(from, { text: '❌ ʀᴇᴘʟʏ ᴛᴏ ᴀᴜᴅɪᴏ/ᴠɴ' }, { quoted: msg })
    }

    try {
      const stream = await sock.downloadMediaMessage({ message: quoted })

      const { exec } = await import('child_process')
      const fs = await import('fs')
      const path = '/tmp/bass_' + Date.now() + '.mp3'
      const out = '/tmp/bass_out_' + Date.now() + '.mp3'

      fs.writeFileSync(path, stream)

      await new Promise((res, rej) => {
        exec(`ffmpeg -i ${path} -af "bass=g=15:f=110:w=0.6" ${out}`, (err) => {
          if (err) rej(err)
          else res()
        })
      })

      const outBuf = fs.readFileSync(out)

      await sock.sendMessage(from, {
        audio: outBuf,
        mimetype: 'audio/mpeg',
        ptt: true
      }, { quoted: msg })

      fs.unlinkSync(path)
      fs.unlinkSync(out)

    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg })
    }
  }
}
