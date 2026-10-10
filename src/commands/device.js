const fs=require('fs')
function getDevice(id){
  if(!id) return "ᴜɴᴋɴᴏᴡɴ"
  let i=id.toUpperCase()
  if(i.startsWith("3EB0") && i.length===22) return "ᴀɴᴅʀᴏɪᴅ"
  if(i.startsWith("3EB0") && i.length===20) return "ɪᴏs"
  if(i.startsWith("3A")) return "ᴡᴇʙ / ᴅᴇsᴋᴛᴏᴘ"
  if(i.startsWith("BAE5") || i.startsWith("B19")) return "ʙᴏᴛ / ʙᴀɪʟᴇʏs"
  if(i.startsWith("3F")) return "ᴡᴇʙ"
  return "ᴀɴᴅʀᴏɪᴅ / ɪᴏs"
}
module.exports={
name:"device",
aliases:["getdevice","dev","linkcheck"],
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

  // target: reply > mention > self
  let targetId=m.sender
  let targetMsg=m
  if(m.quoted) {
   targetId=m.quoted.sender || m.quoted.participant || m.sender
   targetMsg=m.quoted
  } else if(m.mentionedJid && m.mentionedJid[0]){
   targetId=m.mentionedJid[0]
  }

  let msgId=targetMsg.key?.id || targetMsg.id || m.key.id
  let device=getDevice(msgId)

  let isBot = device.includes("ʙᴏᴛ")
  let isWeb = device.includes("ᴡᴇʙ") || device.includes("ᴅᴇsᴋᴛᴏᴘ")

  let num=targetId.split("@")[0]
  let name=targetMsg.pushName || "ɴ/ᴀ"

  let result=`ᴅᴇᴠɪᴄᴇ ᴄʜᴇᴄᴋ

ᴜsᴇʀ: @${num}
ɴᴀᴍᴇ: ${name}
ᴅᴇᴠɪᴄᴇ: ${device}
ᴍsɢ ɪᴅ: ${msgId.slice(0,12)}...

${isBot? "⚠️ ʙᴏᴛ ᴅᴇᴛᴇᴄᴛᴇᴅ" : ""}
${isWeb? "⚠️ ᴜsɪɴɢ ᴡʜᴀᴛsᴀᴘᴘ ᴡᴇʙ / ʟɪɴᴋᴇᴅ ᴅᴇᴠɪᴄᴇ - ᴍᴀʏʙᴇ ʟʏɪɴɢ" : "✅ ᴏɴ ᴘʜᴏɴᴇ"}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

  await sock.sendMessage(m.chat,{text:result, mentions:[targetId]},{quoted:m})

 }catch(e){
  console.log(e)
  await sock.sendMessage(m.chat,{text:"ᴅᴇᴠɪᴄᴇ ᴄʜᴇᴄᴋ ғᴀɪʟᴇᴅ"},{quoted:m})
 }
}
}
