export default {
  name: 'mp3',
  aliases: ['toaudio', 'tomp3', 'mp4tomp3'],
  async execute(sock, from, msg) {
    try { await sock.sendMessage(from, { react: { text: '🎵', key: msg.key } }) } catch {}

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted) {
      return await sock.sendMessage(from, { text: '❌ ʀᴇᴘʟʏ ᴛᴏ ᴠɪᴅᴇᴏ/ᴀᴜᴅɪᴏ' }, { quoted: msg })
    }

    const type = Object.keys(quoted)[0]
    if (!['videoMessage', 'audioMessage'].includes(type)) {
      return await sock.sendMessage(from, { text: '❌ ʀᴇᴘʟʏ ᴛᴏ ᴠɪᴅᴇᴏ ᴏɴʟʏ' }, { quoted: msg })
    }

    try {
      await sock.sendMessage(from, { text: '⏳ ᴄᴏɴᴠᴇʀᴛɪɴɢ...' }, { quoted: msg })

      const stream = await sock.downloadMediaMessage({ message: quoted })

      await sock.sendMessage(from, {
        audio: stream,
        mimetype: 'audio/mpeg',
        fileName: 'cyber_md.mp3',
        ptt: false
      }, { quoted: msg })

      await sock.sendMessage(from, {
        text: `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄʏʙᴇʀ ᴍᴅ`
      })

    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg })
    }
  }
}
