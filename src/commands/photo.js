export default {
  name: 'photo',
  aliases: ['toimg', 'toimage', 'topng'],
  ownerOnly: true,
  async execute(sock, from, msg) {
    try { await sock.sendMessage(from, { react: { text: '🖼️', key: msg.key } }) } catch {}

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted || !quoted.stickerMessage) {
      return await sock.sendMessage(from, { text: '❌ ʀᴇᴘʟʏ ᴛᴏ sᴛɪᴄᴋᴇʀ' }, { quoted: msg })
    }

    try {
      const stream = await sock.downloadMediaMessage({ message: quoted })

      await sock.sendMessage(from, {
        image: stream,
        caption: `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄʏʙᴇʀ ᴍᴅ`
      }, { quoted: msg })

    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg })
    }
  }
}
