function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}
import fs from 'fs'
import path from 'path'

export default {
name:"addvoice",
alias:["savevoice","setvoice","voiceadd"],
execute: async(sock, m, args)=>{
 try{
  // REAL CHECK: subbot owner = linked device owner (owner of his instance)
  // isOwner = real creator, isSubBotOwner = subbot/liked device owner
  if(!m.isOwner &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required, owner only - subbot owner allowed")}`},{quoted:m})
  }

  let voiceName = args[0]?.toLowerCase() || "default"
  let quotedAudio = m.quoted?.message?.audioMessage || m.message?.audioMessage
  let quotedVN = m.quoted?.message?.pttMessage || m.message?.pttMessage

  let dbPath = "./src/database/voices.json"
  if(!fs.existsSync("./src/database")) fs.mkdirSync("./src/database",{recursive:true})
  if(!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({},null,2))

  let db = JSON.parse(fs.readFileSync(dbPath))

  if(!quotedAudio &&!quotedVN &&!m.quoted?.message?.documentMessage){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("reply to a voice note to save it")}\n\n${toSmallCaps("example:.addvoice stormvoice (reply to audio)")}\n\n${toSmallCaps("saved voices:")} ${Object.keys(db).join(', ')||"none"}`},{quoted:m})
  }

  let userId = m.sender.split('@')[0]
  if(!db[userId]) db[userId] = {}
  db[userId][voiceName] = {
   savedAt: new Date().toISOString(),
   type: "voice",
   name: voiceName,
   owner: userId,
   isSubBot: m.isSubBotOwner? true : false
  }

  fs.writeFileSync(dbPath, JSON.stringify(db,null,2))

  await sock.sendMessage(m.chat,{
   text:`╭━─━─❰ 🎙️ 𝐕𝐎𝐈𝐂𝐄 𝐒𝐀𝐕𝐄𝐃 ❱─━─━╮
┃ ${toSmallCaps(`name: ${voiceName}`)}
┃ ${toSmallCaps(`owner: ${userId}`)}
┃ ${toSmallCaps(`type: ${m.isSubBotOwner? "subbot owner (linked device)" : "real owner"}`)}
┃ ${toSmallCaps(`status: active`)}
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("use.aivoice or.myvoices to check")}`,
   contextInfo:{
    forwardedNewsletterMessageInfo:{
     newsletterJid:"120363414065055650@newsletter",
     newsletterName:"STORM CYBER MD",
     serverMessageId:1
    }
   }
  },{quoted:m})

 }catch(e){ console.log(e) }
}
}
