export default {
 name: 'hide',
 aliases: ['hidetag', 'ghost', 'ht'],
 async execute(sock, from, msg, args) {
  try{ await sock.sendMessage(from, { react: { text: '👻', key: msg.key } }) }catch{}

  const isGroup = from.endsWith('@g.us')
  if(!isGroup){
    return sock.sendMessage(from,{
      text:`*╭───「 👻 ʜɪᴅᴇ ᴇʀᴏʀ 」───⬣*
*│❌ ᴏɴʟʏ ғᴏʀ ɢʀᴏᴜᴘs*
*╰────────────────⬣*`
    },{quoted:msg})
  }

  const metadata = await sock.groupMetadata(from)
  const senderId = msg.key.participant || from
  const sender = metadata.participants.find(p=>p.id===senderId)
  
  // NOT FOR LOCAL USERS - RESTRICTED
  if(!sender?.admin){
    try{ await sock.sendMessage(from, { react: { text: '💀', key: msg.key } }) }catch{}
    return sock.sendMessage(from,{
      text:`*╭───「 🔒 ʀᴇsᴛʀɪᴄᴛᴇᴅ 」───⬣*
*│❌ ᴏɴʟʏ ɢʜᴏsᴛ ᴜsᴇʀs ᴀʟʟᴏᴡᴇᴅ*
*│👁️ ᴀᴅᴍɪɴs ᴏɴʟʏ*
*╰────────────────⬣*`
    },{quoted:msg})
  }

  let text = args.join(' ')
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if(!text && quoted){
    text = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || '👻'
  }
  if(!text) text = '👻 ɢʜᴏsᴛ ᴄᴀʟʟ'

  const finalText = `*╭───「 👻 ɢʜᴏsᴛ ʜɪᴅᴇ 」───⬣*
${text}
*╰────────────────⬣*
*◇ ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ*`

  try{ await sock.sendMessage(from, { react: { text: '✅', key: msg.key } }) }catch{}

  await sock.sendMessage(from, {
    text: finalText,
    mentions: metadata.participants.map(p=>p.id)
  }, { quoted: msg })
 }
}
