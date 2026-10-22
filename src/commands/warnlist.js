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

export default {
name:"warnlist",
alias:["listwarn","warns","allwarns"], // FIXED: was aliases
execute: async(sock,m,args)=>{
 try{
  if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("only in groups")}`},{quoted:m})

  let meta = await sock.groupMetadata(m.chat)
  let isAdmin = meta.participants.find(p=>p.id===m.sender)?.admin
  if(!m.isOwner && !m.isSubBotOwner && !isAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("only admin or owner")}`},{quoted:m})

  await sock.sendMessage(m.chat,{react:{text:"⚠️",key:m.key}}).catch(()=>{})

  let botId = m.botNumber

  // limit for display
  let limitDb = load(getLimitFile(botId))
  let limit = limitDb[m.chat]?.limit || 3

  let db = load(getWarnFile(botId))
  let groupWarns = db[m.chat] || {}

  let entries = Object.entries(groupWarns)
  if(entries.length===0){
   return await sock.sendMessage(m.chat,{text:`╭───⭓ ${toSC("warnlist")} ⭓───╮
│ ${toSC("no warns in this group")}
│ ${toSC("limit")}: ${limit}
╰────────────────⭓
> ${toSC("powered by storm cyber md")}`},{quoted:m})
  }

  let txt = `╭──⭓ ${toSC("warnlist")} ⭓──╮\n`
  txt += `│ ${toSC("chat")}: ${meta.subject.slice(0,20)}\n`
  txt += `│ ${toSC("total")}: ${entries.length} ${toSC("users warned")}\n`
  txt += `│ ${toSC("limit")}: ${limit}\n`
  txt += `╰───────────────⭓\n\n`

  let mentions=[]
  let i=1
  for(let [jid,data] of entries){
   let count = typeof data==='number' ? data : (data.count||data.warns||0)
   let num = jid.split('@')[0]
   mentions.push(jid)
   txt += `╭──⭓ ${i}. @${num} ⭓──╮\n`
   txt += `│ ${toSC("warns")}: ${count}/${limit}\n`
   txt += `│ ${toSC("number")}: ${num}\n`
   txt += `╰───────────────⭓\n\n`
   i++
  }

  txt += `> ${toSC("powered by storm cyber md")}`

  await sock.sendMessage(m.chat,{text:txt, mentions},{quoted:m})

 }catch(e){ console.log(e) }
}
}
