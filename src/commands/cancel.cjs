import { schedules } from './scheduled.js'

export default {
  name: 'cancel',
  aliases: ['cancelschedule', 'delschedule', 'unschedule'],
  async execute(sock, from, msg, args) {
    try { await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }) } catch {}

    if (!args[0]) {
      return await sock.sendMessage(from, {
        text: `╭══〘 ❌ ᴄᴀɴᴄᴇʟ 〙══⊷❍
┃✯│.cancel <id>
┃✯│.cancel all
┃✯│ ɢᴇᴛ ɪᴅ ғʀᴏᴍ.scheduled
╰══════════════════════⊷❍`
      }, { quoted: msg })
    }

    if (args[0].toLowerCase() === 'all') {
      const before = schedules.length
      schedules.length = 0
      return await sock.sendMessage(from, { text: `✅ ᴄᴀɴᴄᴇʟᴇᴅ ${before} sᴄʜᴇᴅᴜʟᴇs` }, { quoted: msg })
    }

    const id = parseInt(args[0])
    const idx = schedules.findIndex(s => s.id === id && s.from === from)

    if (idx === -1) {
      return await sock.sendMessage(from, { text: `❌ ɪᴅ ${id} ɴᴏᴛ ғᴏᴜɴᴅ` }, { quoted: msg })
    }

    schedules.splice(idx, 1)
    await sock.sendMessage(from, {
      text: `╭══〘 ✅ ᴄᴀɴᴄᴇʟᴇᴅ 〙══⊷❍
┃✯│ ɪᴅ: ${id}
╰══════════════════════⊷❍`
    }, { quoted: msg })
  }
}
