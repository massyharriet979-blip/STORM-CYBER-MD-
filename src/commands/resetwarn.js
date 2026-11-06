import fs from 'fs'
import path from 'path'

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('')
}

const DIR='./database'
function getWarnFile(b){ return path.join(DIR,`warns_${b}.json`) }
function getLimitFile(b){ return path.join(DIR,`warnlimit_${b}.json`) }
function load(f){ try{ if(!fs.existsSync(f)) return {}; return JSON.parse(fs.readFileSync(f)) }catch{ return {} } }
function save(f,d){ fs.mkdirSync(DIR,{recursive:true}); fs.writeFileSync(f, JSON.stringify(d,null,2)) }

export default {
name:"resetwarn",
alias:["unwarn","resetwarns","clearwarn"],
execute: async(sock,m,args)=>{
 try{
  if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("only in groups")}`},{quoted:m})

  let meta = await sock.groupMetadata(m.chat)
  let isAdmin = meta.participants.find(p=>p.id===m.sender)?.admin
  if(!m.isOwner && !m.isSubBotOwner && !isAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("only admin or owner")}`},{quoted:m})

  let botId = m.botNumber
  let warnsDb = load(getWarnFile(botId))

  // IF NO ARGS AND NO REPLY/MENTION = RESET ALL IN GROUP
  // .resetwarn all
  // .resetwarn @user
  // .resetwarn (reply to user)
  let isAll = args[0]?.toLowerCase() === "all"

  if(isAll){
   if(warnsDb[m.chat]){
    delete warnsDb[m.chat]
    save(getWarnFile(botId), warnsDb)
   }
   return await sock.sendMessage(m.chat,{text:`╭══〘 ✅ 𝐑𝐄𝐒𝐄𝐓 𝐖𝐀𝐑𝐍 〙══⊷❍
┃ ${toSC("all warns cleared in this group")}
┃ ${toSC("everyone is now 0")}
╰═══════════════════⊷❍
> ${toSC("powered by storm cyber md")}`},{quoted:m})
  }

  let target = null
  if(m.quoted) target = m.quoted.sender
  else if(m.mentionedJid && m.mentionedJid[0]) target = m.mentionedJid[0]
  else if(args[0]){
   let num = args[0].replace(/[^0-9]/g,'')
   if(num) target = num+'@s.whatsapp.net'
  }

  if(!target) return await sock.sendMessage(m.chat,{text:`${toSC("usage")}: .resetwarn @user | .resetwarn all | reply to user`},{quoted:m})

  let oldCount = warnsDb[m.chat]?.[target]?.count || 0

  if(warnsDb[m.chat] && warnsDb[m.chat][target]){
   delete warnsDb[m.chat][target]
   save(getWarnFile(botId), warnsDb)
  }

  await sock.sendMessage(m.chat,{text:`╭══〘 ✅ 𝐔𝐍𝐖𝐀𝐑𝐍 〙══⊷❍
┃ @${target.split('@')[0]} ${toSC("warns cleared")}
┃ ${toSC("old warns")}: ${oldCount}
┃ ${toSC("now")}: 0
╰═══════════════════⊷❍
> ${toSC("powered by storm cyber md")}`, mentions:[target]},{quoted:m})

 }catch(e){ console.log(e) }
}
}
