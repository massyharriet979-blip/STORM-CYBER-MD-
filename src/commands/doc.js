export default {
  name: 'doc',
  aliases: ['todoc', 'todocument'],
  ownerOnly: true,
  async execute(sock, from, msg, args) {
    try { await sock.sendMessage(from, { react: { text: '📄', key: msg.key } }) } catch {}

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted) {
      return await sock.sendMessage(from, { text: '❌ ʀᴇᴘʟʏ ᴛᴏ ɪᴍᴀɢᴇ/ᴠɪᴅᴇᴏ/ᴀᴜᴅɪᴏ' }, { quoted: msg })
    }

    try {
      const stream = await sock.downloadMediaMessage({ message: quoted })
      const type = Object.keys(quoted)[0]

      let mimetype = 'application/octet-stream'
      let fileName = 'cyber_md_document'

      if (type === 'imageMessage') {
        mimetype = 'image/jpeg'
        fileName = 'cyber_md.jpg'
      } else if (type === 'videoMessage') {
        mimetype = 'video/mp4'
        fileName = 'cyber_md.mp4'
      } else if (type === 'audioMessage') {
        mimetype = 'audio/mpeg'
        fileName = 'cyber_md.mp3'
      }

      await sock.sendMessage(from, {
        document: stream,
        mimetype: mimetype,
        fileName: fileName
      }, { quoted: msg })

    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg })
    }
  }
}
