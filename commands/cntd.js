export default {
  name: 'cntd',
  aliases: ['countdown', 'countd'],
  async execute(sock, from, msg, args) {
    try { await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } }) } catch {}

    if (!args[0]) {
      return await sock.sendMessage(from, {
        text: `╭══〘 ⏳ ᴄᴏᴜɴᴛᴅᴏᴡɴ 〙══⊷❍
┃✯│.cntd 10
┃✯│.cntd 5 gooo
╰══════════════════════⊷❍`
      }, { quoted: msg })
    }

    let count = parseInt(args[0])
    const text = args.slice(1).join(' ') || 'ɢᴏᴏᴏ!'

    if (isNaN(count) || count > 20) {
      return await sock.sendMessage(from, { text: '❌ ᴍᴀx 20 sᴇᴄ' }, { quoted: msg })
    }

    let sent = await sock.sendMessage(from, { text: `⏳ sᴛᴀʀᴛɪɴɢ ${count}...` }, { quoted: msg })

    const interval = setInterval(async () => {
      count--
      if (count > 0) {
        try {
          await sock.sendMessage(from, { text: `⏳ ${count}...`, edit: sent.key })
        } catch {
          await sock.sendMessage(from, { text: `⏳ ${count}...` })
        }
      } else {
        clearInterval(interval)
        await sock.sendMessage(from, { text: `🚀 ${text}` })
      }
    }, 1000)
  }
}
