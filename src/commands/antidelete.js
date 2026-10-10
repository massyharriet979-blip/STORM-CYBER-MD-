const fs=require('fs')
module.exports={
name:"antidelete",
aliases:["antidel","ad","anti"],
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

  let file=`./database/antidelete_${botId}.json`
  let data=[]
  try{ if(fs.existsSync(file)) data=JSON.parse(fs.readFileSync(file)) }catch{}
  if(!Array.isArray(data)) data=[]

  let action=(args[0]||"").toLowerCase()
  let chatId=m.chat

  if(!action){
   let isOn=data.includes(chatId)
   return await sock.sendMessage(m.chat,{text:`ᴀɴᴛɪᴅᴇʟᴇᴛᴇ sᴇᴛᴛɪɴɢs

sᴛᴀᴛᴜs: ${isOn? "ᴏɴ ✅": "ᴏғғ ❌"}
ᴄʜᴀᴛ: ${chatId}

ᴜsᴀɢᴇ:
.ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏɴ
.ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏғғ

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
  }

  if(action==="on"||action==="enable"){
   if(!data.includes(chatId)) data.push(chatId)
   fs.mkdirSync("./database",{recursive:true})
   fs.writeFileSync(file, JSON.stringify(data))
   return await sock.sendMessage(m.chat,{text:`ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴇɴᴀʙʟᴇᴅ ✅\nɪɴ ᴛʜɪs ᴄʜᴀᴛ ᴅᴇʟᴇᴛᴇᴅ ᴍsɢs ᴡɪʟʟ ʙᴇ ʀᴇsᴛᴏʀᴇᴅ\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
  }

  if(action==="off"||action==="disable"){
   data=data.filter(id=>id!==chatId)
   fs.mkdirSync("./database",{recursive:true})
   fs.writeFileSync(file, JSON.stringify(data))
   return await sock.sendMessage(m.chat,{text:`ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅɪsᴀʙʟᴇᴅ ❌\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
  }

  await sock.sendMessage(m.chat,{text:`ɪɴᴠᴀʟɪᴅ. ᴜsᴇ ᴏɴ/ᴏғғ`},{quoted:m})

 }catch(e){ console.log(e) }
}
}
