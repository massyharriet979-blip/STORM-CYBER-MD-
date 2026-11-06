export default {
 name: 'antiword',
 aliases: ['wordprotect','badword'],
 async execute(sock, from, msg, args){
  const senderId = msg.key.participant || msg.key.remoteJid
  const isAllowed = global.owner?.includes(senderId) || global.sudo?.includes(senderId) || msg.key.fromMe
  if(!isAllowed){
   try{ await sock.sendMessage(from,{react:{text:'⛔',key:msg.key}}) }catch{}
   return sock.sendMessage(from,{text:`┏━━━━━━༻❁༺━━━━━━┓\n┃ ⚛️ 𝚀𝚄𝙰𝙽𝚃𝚄𝙼 𝙲𝙾𝚄𝙽𝙲𝙸𝙻 𝙲𝙻𝙴𝙰𝚁𝙰𝙽𝙲𝙴 𝚁𝙴𝚀𝚄𝙸𝚁𝙴𝙳\n┃ 🧬 𝐀𝐑𝐂𝐇𝐈𝐓𝐄𝐂𝐓-𝐋𝐄𝐕𝐄𝐋 𝐎𝐍𝐋𝐘\n┗━━━━━━༻❁༺━━━━━━┛`},{quoted:msg})
  }

  if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:`╔════════════╗\n║ Group only\n╚════════════╝`},{quoted:msg})

  global.db = global.db || {}; global.db.antiword = global.db.antiword || {}
  if(!global.db.antiword[from]) global.db.antiword[from] = {enabled:false, words:['fuck','porn','xxx','sex'], warnings:{}, warnLimit:3}
  const data = global.db.antiword[from]

  const action = args[0]?.toLowerCase()

  if(!action || action==='status'){
   return sock.sendMessage(from,{text:`◈ ━━･ STORM ･━━ ◈\n┃ 🛡️ 𝗔𝗡𝗧𝗜𝗪𝗢𝗥𝗗 𝗦𝗧𝗔𝗧𝗨𝗦\n┃ ᴀᴄᴛɪᴠᴇ: ${data.enabled?'ʏᴇs':'ɴᴏ'}\n┃ 𝐖𝐨𝐫𝐝𝐬: ${data.words.length}\n┃ 𝐋𝐢𝐦𝐢𝐭: ${data.warnLimit}\n┃\n┃.antiword on/off\n┃.antiword add <word>\n┃.antiword del <word>\n┃.antiword list\n┃.setwarnlimit 3\n◈ ━━━━━━━━ ◈`},{quoted:msg})
  }

  if(action==='on' || action==='off'){
   data.enabled = action==='on'
   await sock.sendMessage(from,{react:{text:'🛡️',key:msg.key}})
   return sock.sendMessage(from,{text:`${data.enabled?
`┏━━━━━━༻❁༺━━━━━━┓\n┃ 🛡️ 𝗔𝗡𝗧𝗜𝗪𝗢𝗥𝗗 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗\n┃ ◈ ━━･ STORM ･━━ ◈\n┃ ᴀɴᴛɪᴡᴏʀᴅ ᴘʀᴏᴛᴏᴄᴏʟ ᴇɴᴀʙʟᴇᴅ\n┃ 𝐖𝐨𝐫𝐝𝐬: ${data.words.length}\n┗━━━━━━༻❁༺━━━━━━┛`
:
`╔════════════╗\n║ 🛡️ 𝙰𝙽𝚃𝙸𝚆𝙾𝚁𝙳 𝙾𝙵\n╚════════════╝`}`},{quoted:msg})
  }

  if(action==='add'){
   const word = args[1]?.toLowerCase()
   if(!word) return sock.sendMessage(from,{text:`╔════════════╗\n║ Add word:.antiword add fuck\n╚════════════╝`},{quoted:msg})
   if(data.words.includes(word)) return sock.sendMessage(from,{text:`◈ ━━･ STORM ･━━ ◈\n┃ Already exists\n◈ ━━━━━━━━ ◈`},{quoted:msg})
   data.words.push(word)
   await sock.sendMessage(from,{react:{text:'✅',key:msg.key}})
   return sock.sendMessage(from,{text:`┏━━━━━━༻❁༺━━━━━━┓\n┃ ✅ 𝗪𝗢𝗥𝗗 𝗔𝗗𝗗𝗘𝗗\n┃ 𝐖𝐨𝐫𝐝: ${word}\n┗━━━━━━༻❁༺━━━━━━┛`},{quoted:msg})
  }

  if(action==='del' || action==='remove'){
   const word = args[1]?.toLowerCase()
   if(!word) return sock.sendMessage(from,{text:`╔════════════╗\n║.antiword del fuck\n╚════════════╝`},{quoted:msg})
   data.words = data.words.filter(w=>w!==word)
   await sock.sendMessage(from,{react:{text:'🗑️',key:msg.key}})
   return sock.sendMessage(from,{text:`╔════════════╗\n║ 🗑️ 𝗪𝗢𝗥𝗗 𝗥𝗘𝗠𝗢𝗩𝗘𝗗: ${word}\n╚════════════╝`},{quoted:msg})
  }

  if(action==='list'){
   return sock.sendMessage(from,{text:`◈ ━━･ STORM ･━━ ◈\n┃ 📝 𝗕𝗟𝗔𝗖𝗞𝗟𝗜𝗦𝗧𝗘𝗗 𝗪𝗢𝗥𝗗𝗦\n┃ ${data.words.join(', ')}\n◈ ━━━━━━━━ ◈`},{quoted:msg})
  }
 }
}

// ================== HANDLER FOR INDEX.JS - WILL GIVE LATER ==================
export async function antiwordHandler(sock, from, msg){
  try{
   if(!from.endsWith('@g.us')) return
   const data = global.db?.antiword?.[from]
   if(!data?.enabled) return
   const body = (msg.body || '').toLowerCase()
   if(!body) return

   const sender = msg.key.participant || msg.key.remoteJid
   const botId = sock.user.id.split(':')[0]+'@s.whatsapp.net'
   if(sender===botId || global.owner?.includes(sender) || global.sudo?.includes(sender)) return
   try{ const meta=await sock.groupMetadata(from); if(meta.participants.find(p=>p.id===sender)?.admin) return }catch{}

   const found = data.words.find(w=> body.includes(w.toLowerCase()))
   if(!found) return

   data.warnings = data.warnings || {}
   data.warnings[sender] = (data.warnings[sender]||0)+1
   const wc = data.warnings[sender]
   const limit = global.db?.antilink?.[from]?.warnLimit || data.warnLimit || 3

   try{ await sock.sendMessage(from,{delete:msg.key}) }catch{}

   if(wc < limit){
     if(wc===1) return sock.sendMessage(from,{text:`┏━━━━━━༻❁༺━━━━━━┓\n┃ @${sender.split('@')[0]} 𝙱𝙰𝙳 𝚆𝙾𝚁𝙳𝚂 𝙰𝚁𝙴 𝙽𝙾𝚃 𝙰𝙻𝙻𝙾𝚆𝙴𝙳 𝙷𝙴𝚁𝙴. ${wc}/${limit}\n┃ 𝐖𝐨𝐫𝐝: ${found}\n┗━━━━━━༻❁༺━━━━━━┛`,mentions:[sender]})
     if(wc===2) return sock.sendMessage(from,{text:`◈ ━━･ STORM ･━━ ◈\n┃ @${sender.split('@')[0]} 𝙱𝙰𝙳 𝚆𝙾𝚁𝙳 𝙵𝙾𝚁𝙱𝙸𝙳𝙳𝙴𝙽. ${wc}/${limit}\n◈ ━━━━━━━━ ◈`,mentions:[sender]})
     return sock.sendMessage(from,{text:`╔════════════╗\n║ @${sender.split('@')[0]} 𝙱𝙰𝙳 𝚆𝙾𝚁𝙳𝚂 𝙽𝙾𝚃 𝙰𝙻𝙻𝙾𝚆𝙴𝙳 ${wc}/${limit}\n╚════════════╝`,mentions:[sender]})
   }else{
     await sock.sendMessage(from,{text:`┏━━━━━━༻❁༺━━━━━━┓\n┃ @${sender.split('@')[0]} 𝚈𝙾𝚄𝚁 𝙾𝙵𝙵𝚂𝙸𝙳𝙴. 𝚈𝙾𝚄 𝙰𝚁𝙴 𝙰 𝚆𝙰𝚂𝚃𝙴𝙳 𝚂𝙿𝙰𝙼. 𝙺𝙸𝙲𝙺𝙸𝙽𝙶..\n┗━━━━━━༻❁༺━━━━━━┛`,mentions:[sender]})
     await new Promise(r=>setTimeout(r,800))
     try{ await sock.groupParticipantsUpdate(from,[sender],'remove') }catch{}
     data.warnings[sender]=0
     return sock.sendMessage(from,{text:`◈ ━━･ STORM ･━━ ◈\n┃ @${sender.split('@')[0]} 𝙺𝙸𝙲𝙺𝙴𝙳 𝙵𝙾𝚁 𝙱𝙰𝙳 𝚆𝙾𝚁𝙳𝚂.\n◈ ━━━━━━━━ ◈`,mentions:[sender]})
   }
  }catch{}
}
