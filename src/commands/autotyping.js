const fs=require('fs')
module.exports={
name:"autotyping",
aliases:["autotype","typing"],
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
  if(isGroupAdmin &&!isOwner &&!isSudo){
   return await sock.sendMessage(m.chat,{text:"ʏᴏᴜ ᴀʀᴇ ʀᴇsᴛʀɪᴄᴛᴇᴅ ᴛᴏ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ"},{quoted:m})
  }
  if(isSudo &&!isOwner){
   return await sock.sendMessage(m.chat,{text:"ʏᴏᴜ ʜᴀᴠᴇ ʟɪᴍɪᴛs ᴛᴏ sᴏᴍᴇ ᴄᴏᴍᴍᴀɴᴅs"},{quoted:m})
  }

  let file=`./database/autotyping_${botId}.json`
  let data={enabled:false}
  try{ if(fs.existsSync(file)) data=JSON.parse(fs.readFileSync(file)) }catch{}

  let action=(args[0]||"").toLowerCase()

  if(!action){
   return await sock.sendMessage(m.chat,{text:`ᴀᴜᴛᴏᴛʏᴘɪɴɢ\n\nsᴛᴀᴛᴜs: ${data.enabled? "ᴏɴ ✅": "ᴏғғ ❌"}\n\n.ᴀᴜᴛᴏᴛʏᴘɪɴɢ ᴏɴ\n.ᴀᴜᴛᴏᴛʏᴘɪɴɢ ᴏғғ\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
  }

  if(action==="on"||action==="enable"){
   fs.mkdirSync("./database",{recursive:true})
   fs.writeFileSync(file, JSON.stringify({enabled:true}))
   return await sock.sendMessage(m.chat,{text:`ᴀᴜᴛᴏᴛʏᴘɪɴɢ ᴇɴᴀʙʟᴇᴅ ✅\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
  }

  if(action==="off"||action==="disable"){
   fs.mkdirSync("./database",{recursive:true})
   fs.writeFileSync(file, JSON.stringify({enabled:false}))
   return await sock.sendMessage(m.chat,{text:`ᴀᴜᴛᴏᴛʏᴘɪɴɢ ᴅɪsᴀʙʟᴇᴅ ❌\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
  }

 }catch(e){ console.log(e) }
}
}
