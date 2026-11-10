import fs from 'fs'

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"setwarnlimit",
alias:["warnlimit","setlimit"],
execute: async(sock, m, args)=>{
 try{
  // 2.A - GROUPS ONLY
  if(!m.isGroup){
   return sock.sendMessage(m.chat,{text:`╭══〘 ⚠️ 〙══⊷❍
┃ ${toSmallCaps("only works in groups")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`},{quoted:m})
  }

  // 1.B - OWNER OR GROUP ADMIN
  let isOwner = m.isOwner || m.isSubBotOwner
  let isAdmin = false
  if(!isOwner){
   try{
    let meta = await sock.groupMetadata(m.chat)
    let part = meta.participants.find(p=>p.id===m.sender)
    if(part?.admin) isAdmin = true
   }catch{}
  }
  if(!isOwner && !isAdmin){
   return sock.sendMessage(m.chat,{text:`╭══〘 🔐 〙══⊷❍
┃ ${toSmallCaps("only group admin or owner can use this")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`},{quoted:m})
  }

  let botId = m.botNumber
  let wlFile = `./database/warnlimit_${botId}.json`
  let warnsFile = `./database/warns_${botId}.json`

  // LOAD CURRENT
  let wlDb = {}
  if(fs.existsSync(wlFile)){ try{ wlDb = JSON.parse(fs.readFileSync(wlFile)) }catch{} }
  let current = wlDb[m.chat]?.limit || 3

  // 4 - NO NUMBER = SHOW USAGE + CURRENT
  if(!args[0]){
   return sock.sendMessage(m.chat,{text:`╭══〘 ⚠️ 𝐖𝐀𝐑𝐍 𝐋𝐈𝐌𝐈𝐓 〙══⊷❍
┃ ${toSmallCaps("usage")}: .setwarnlimit 5
┃ ${toSmallCaps("current limit")}: ${current}
┃ ${toSmallCaps("max limit")}: 15
┃ ${toSmallCaps("default")}: 3
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`},{quoted:m})
  }

  let num = parseInt(args[0])

  if(isNaN(num)){
   return sock.sendMessage(m.chat,{text:toSmallCaps("enter a valid number, example .setwarnlimit 5")},{quoted:m})
  }

  // 3 - MAX 15, MIN 1
  if(num < 1 || num > 15){
   return sock.sendMessage(m.chat,{text:`╭══〘 ❌ 〙══⊷❍
┃ ${toSmallCaps("limit must be between 1 and 15")}
┃ ${toSmallCaps("you typed")}: ${num}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`},{quoted:m})
  }

  // SAVE - SAME FORMAT INDEX.JS READS
  if(!wlDb[m.chat]) wlDb[m.chat] = {}
  wlDb[m.chat].limit = num
  fs.mkdirSync('./database',{recursive:true})
  fs.writeFileSync(wlFile, JSON.stringify(wlDb,null,2))

  // 5.A - RESET WARNS FOR THIS GROUP
  try{
   if(fs.existsSync(warnsFile)){
    let warnsDb = JSON.parse(fs.readFileSync(warnsFile))
    if(warnsDb[m.chat]){
     delete warnsDb[m.chat]
     fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2))
    }
   }
  }catch{}

  await sock.sendMessage(m.chat,{text:`╭══〘 ✅ 𝐖𝐀𝐑𝐍 𝐋𝐈𝐌𝐈𝐓 〙══⊷❍
┃ ${toSmallCaps("warn limit set to")}: ${num}
┃ ${toSmallCaps("old limit was")}: ${current}
┃ ${toSmallCaps("all warns in this group reset to 0")}
┃ ${toSmallCaps("users will be kicked after")} ${num} ${toSmallCaps("warns")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`},{quoted:m})

 }catch(e){ console.log(e) }
}
}
