const fs=require('fs')
function detectPlatform(id){
  if(!id) return {platform:"ᴜɴᴋɴᴏᴡɴ", os:"ᴜɴᴋɴᴏᴡɴ"}
  let s=id.toUpperCase()
  if(s.startsWith("3EB0")){
    if(s.length===22) return {platform:"ᴍᴏʙɪʟᴇ", os:"ᴀɴᴅʀᴏɪᴅ"}
    if(s.length===20) return {platform:"ᴍᴏʙɪʟᴇ", os:"ɪᴏs"}
    return {platform:"ᴍᴏʙɪʟᴇ", os:"ᴀɴᴅʀᴏɪᴅ/ɪᴏs"}
  }
  if(s.startsWith("3A")) return {platform:"ᴡᴇʙ", os:"ᴡɪɴᴅᴏᴡs/ᴍᴀᴄ - ᴄʜʀᴏᴍᴇ"}
  if(s.startsWith("BAE5")||s.startsWith("B19")||s.startsWith("3F")) return {platform:"ᴡᴇʙ", os:"ʙᴀɪʟᴇʏs/ʙᴏᴛ"}
  return {platform:"ᴍᴏʙɪʟᴇ", os:"ᴀɴᴅʀᴏɪᴅ"}
}
module.exports={
name:"platform",
aliases:["pf","os","whatsapp"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]

  let sudoList=[]
  try{ if(fs.existsSync("./database/sudo.json")) sudoList=JSON.parse(fs.readFileSync("./database/sudo.json")) }catch{}
  let subSudoPath=`./database/sudo_${botId}.json`
  try{ if(fs.existsSync(subSudoPath)){ let extra=JSON.parse(fs.readFileSync(subSudoPath)); sudoList=sudoList.concat(extra) } }catch{}

  let isOwner=sender===botId
  let isSudo=sudoList.includes(sender)
  let isGroupAdmin=false
  if(m.isGroup){
   try{
    let meta=await sock.groupMetadata(m.chat)
    let admins=meta.participants.filter(p=>p.admin!==null).map(a=>a.id.split("@")[0])
    if(admins.includes(sender)) isGroupAdmin=true
   }catch{}
  }
  if(!isOwner &&!isSudo &&!isGroupAdmin){
   return await sock.sendMessage(m.chat,{text:"ǫᴜᴀɴᴛᴜᴍ ᴄʟᴇᴀʀᴀɴᴄᴇ ʀᴇǫᴜɪʀᴇᴅ"},{quoted:m})
  }

  let targetId=m.sender
  let targetMsg=m
  if(m.quoted){
   targetId=m.quoted.sender||m.quoted.participant||m.sender
   targetMsg=m.quoted
  }else if(m.mentionedJid && m.mentionedJid[0]){
   targetId=m.mentionedJid[0]
  }

  let id=targetMsg.key?.id || m.key.id
  let {platform, os}=detectPlatform(id)

  let name=targetMsg.pushName||"ɴ/ᴀ"
  let num=targetId.split("@")[0]

  let msg=`ᴘʟᴀᴛғᴏʀᴍ ᴄʜᴇᴄᴋ

ᴜsᴇʀ: @${num}
ɴᴀᴍᴇ: ${name}
ᴘʟᴀᴛғᴏʀᴍ: ${platform}
ᴏs: ${os}
ᴛʏᴘᴇ: ${platform==="ᴡᴇʙ"? "ʟɪɴᴋᴇᴅ ᴅᴇᴠɪᴄᴇ / ᴅᴇsᴋᴛᴏᴘ" : "ᴅɪʀᴇᴄᴛ ᴘʜᴏɴᴇ"}

${platform==="ᴡᴇʙ"? "⚠️ ɴᴏᴛ ᴏɴ ᴘʜᴏɴᴇ - ᴜsɪɴɢ ᴡᴇʙ" : "✅ ᴏɴ ᴍᴏʙɪʟᴇ"}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

  await sock.sendMessage(m.chat,{text:msg, mentions:[targetId]},{quoted:m})

 }catch(e){ console.log(e) }
}
}
