export default {
  name: 'img',
  aliases: ['image', 'gimage', 'pinterest'],
  async execute(sock, from, msg, args) {
    try { await sock.sendMessage(from, { react: { text: '🖼️', key: msg.key } }) } catch {}

    if (!args[0]) {
      return await sock.sendMessage(from, {
        text: `╭══〘 🖼️ ɪᴍɢ 〙══⊷❍
┃✯│.img cat
┃✯│.img 5 cat
╰══════════════════════⊷❍`
      }, { quoted: msg })
    }

    let count = 1
    let query = args.join(' ')
    if (!isNaN(args[0])) {
      count = Math.min(parseInt(args[0]), 5)
      query = args.slice(1).join(' ')
    }

    if (!query) return await sock.sendMessage(from, { text: '❌ ǫᴜᴇʀʏ ɴᴇᴇᴅᴇᴅ' }, { quoted: msg })

    try {
      await sock.sendMessage(from, { text: `⏳ sᴇᴀʀᴄʜɪɴɢ "${query}"...` }, { quoted: msg })

      // pinterest scraper api
      const api = `https://api.giftedtech.web.id/api/search/pinterest?apikey=gifted&q=${encodeURIComponent(query)}`
      const res = await fetch(api)
      const data = await res.json()

      let images = data.result || data.data || []
      if (images.length === 0) throw new Error('no images')

      for (let i = 0; i < Math.min(count, images.length); i++) {
        let imgUrl = images[i].image || images[i].url || images[i]
        await sock.sendMessage(from, {
          image: { url: imgUrl },
          caption: `╭══〘 🖼️ ${query} 〙══⊷❍\n┃✯│ ${i+1}/${count}\n╰══════════════════════⊷❍\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄʏʙᴇʀ ᴍᴅ`
        }, { quoted: msg })
      }

    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ${e.message}` }, { quoted: msg })
    }
  }
}
