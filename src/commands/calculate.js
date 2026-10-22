export default {
  name: 'calculate',
  aliases: ['calc', 'math', 'cal'],
  async execute(sock, from, msg, args) {
    try { await sock.sendMessage(from, { react: { text: '🏓', key: msg.key } }) } catch {}

    const input = args.join(' ') || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || ''

    if (!input) {
      return await sock.sendMessage(from, { 
        text: `╭══〘 🛡 sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ〙🛡 ═⊷❍
┃✯│ ᴜsᴀɢᴇ: .ᴄᴀʟᴄᴜʟᴀᴛᴇ <ᴇxᴘʀᴇssɪᴏɴ>
┃✯│ ᴇx: .ᴄᴀʟᴄ 5+5*2
┃✯│ ᴇx: .ᴄᴀʟᴄ (100-20)/4
╰══════════════════════⊷❍
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x ᴛᴇᴀᴍ` 
      }, { quoted: msg })
    }

    // safe math only
    let clean = input.replace(/[^0-9+\-*/().%^ ]/g, '').trim()
    if (!clean) return await sock.sendMessage(from, { text: `❌ ɪɴᴠᴀʟɪᴅ ᴇxᴘʀᴇssɪᴏɴ` }, { quoted: msg })

    try {
      // replace ^ with ** 
      clean = clean.replace(/\^/g, '**')
      // prevent ** ** abuse
      if (clean.length > 30) throw new Error('too long')
      const result = Function(`"use strict"; return (${clean})`)()

      const senderName = msg.pushName || 'user'
      const text = `╭══〘 🧮 ᴄᴀʟᴄᴜʟᴀᴛᴏʀ 〙══⊷❍
┃✯│ 👤 ${senderName.toLowerCase()}
┃✯│ 📥 ${input}
┃✯│ 📤 ${result}
┃✯╰───────────────
╰══════════════════════⊷❍
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x ᴛᴇᴀᴍ`

      await sock.sendMessage(from, { text }, { quoted: msg })
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ ᴇʀʀᴏʀ: ɪɴᴠᴀʟɪᴅ ᴍᴀᴛʜ\n${e.message}` }, { quoted: msg })
    }
  }
}
