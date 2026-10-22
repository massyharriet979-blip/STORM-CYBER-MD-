import fs from 'fs'
import path from 'path'

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('')
}

const DIR='./database'
function getFile(b){ return path.join(DIR,`antibug_${b}.json`) }
function getWarnFile(b){ return path.join(DIR,`warns_${b}.json`) }
function getLimitFile(b){ return path.join(DIR,`warnlimit_${b}.json`) }
function load(f){ try{ if(!fs.existsSync(f)) return {}; return JSON.parse(fs.readFileSync(f)) }catch{ return {} } }
function save(f,d){ fs.mkdirSync(DIR,{recursive:true}); fs.writeFileSync(f, JSON.stringify(d,null,2)) }

// DETECTOR - same function index.js will use
export function isBugMessage(text){
 if(!text) return false
 if(text.length > 4000) return true // super long crash
 if(/(\u200e|\u200f|\u202a|\u202b|\u202c|\u202d|\u202e|\u2066|\u2067|\u2068|\u2069)/.test(text)) return true // invisible rtl crash chars
 if(/(.)\1{500,}/.test(text)) return true // 500 same char flood
 if(/wa\.me\/|chat\.whatsapp\.com/.test(text) && text.length > 1000) return true
 if(/[\u{1F000}-\u{1FAFF}]{200,}/u.test(text)) return true // 200 emojis flood
 return false
}

export default {
name:"antibug",
alias:["antivirus","anti-crash","anticrash"],
execute: async(sock,m,args)=>{
 try{
  if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("only in groups")}`},{quoted:m})

  let meta = await sock.groupMetadata(m.chat)
  let isAdmin = meta.participants.find(p=>p.id===m.sender)?.admin
  if(!m.isOwner && !m.isSubBotOwner && !isAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("only admin or owner")}`},{quoted:m})

  let botId = m.botNumber
  let db = load(getFile(botId))
  let current = db[m.chat]?.enabled || false

  let arg = args[0]?.toLowerCase()

  if(!arg || arg==="status"){
   return await sock.sendMessage(m.chat,{text:`╭══〘 🛡️ 𝐀𝐍𝐓𝐈𝐁𝐔𝐆 〙══⊷❍
┃ ${toSC("status")}: ${current ? "ON ✅" : "OFF ❌"}
┃ ${toSC("usage")}: .antibug on / .antibug off
┃ ${toSC("action")}: ${toSC("delete crash msg + warn sender")}
╰═══════════════════⊷❍
> ${toSC("powered by storm cyber md")}`},{quoted:m})
  }

  if(arg==="on"){
   if(!db[m.chat]) db[m.chat]={}
   db[m.chat].enabled = true
   save(getFile(botId), db)
   return await sock.sendMessage(m.chat,{text:`✅ ${toSC("antibug enabled")} - ${toSC("crash messages will be deleted")}`},{quoted:m})
  }

  if(arg==="off"){
   if(!db[m.chat]) db[m.chat]={}
   db[m.chat].enabled = false
   save(getFile(botId), db)
   return await sock.sendMessage(m.chat,{text:`❌ ${toSC("antibug disabled")}`},{quoted:m})
  }

  return await sock.sendMessage(m.chat,{text:`${toSC("usage")}: .antibug on / off`},{quoted:m})
 }catch(e){ console.log(e) }
}
}
