export default {
  name: 'ig',
  aliases: ['insta', 'instagram', 'igdl'],
  async execute(sock, from, msg, args) {
    try { await sock.sendMessage(from, { react: { text: '📸', key: msg.key } }) } catch {}

    if (!args[0]) {
      return await sock.sendMessage(from, {
        text: `╭══〘 📸 ɪɢ 〙══⊷❍
┃✯│.ig <link>
┃✯╰───────────────
╰══════════════════════⊷❍`
      }, { quoted: msg })
    }

    const url = args[0]
    if (!url.includes('instagram.com')) {
      return await sock.sendMessage(from, { text: '❌ ɪɴᴠᴀʟɪᴅ ɪɢ ʟɪɴᴋ' }, { quoted: msg })
    }

    try {
      await sock.sendMessage(from, { text: '⏳ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...' }, { quoted: msg })

      const api = `https://api.giftedtech.web.id/api/download/instadl?apikey=gifted&url=${encodeURIComponent(url)}`
      const res = await fetch(api)
      const data = await res.json()

      const media = data.result?.[0] || data.data?.[0] || data.result
      if (!media?.url) throw new Error('no media')

      const mediaUrl = media.url
      const isVideo = mediaUrl.includes('.mp4') || media.type === 'video'

      if (isVideo) {
        await sock.sendMessage(from, {
          video: { url: mediaUrl },
          caption: `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄʏʙᴇʀ ᴍᴅ`
        }, { quoted: msg })
      } else {
        await sock.sendMessage(from, {
          image: { url: mediaUrl },
          caption: `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄʏʙᴇʀ ᴍᴅ`
        }, { quoted: msg })
      }

    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ғᴀɪʟᴇᴅ: ${e.message}\nᴛʀʏ ᴀɢᴀɪɴ` }, { quoted: msg })
    }
  }
}
