const fs=require('fs')
module.exports={
name:"shutdown",
aliases:["off","poweroff"],
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

  await sock.sendMessage(m.chat,{react:{text:"💤",key:m.key}})
  await sock.sendMessage(m.chat,{text:"sʜᴜᴛᴛɪɴɢ ᴅᴏᴡɴ sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ..."}, {quoted:m})
  await new Promise(r=>setTimeout(r,2500))
  await sock.sendMessage(m.chat,{text:"sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ sʜᴜᴛᴅᴏᴡɴ sɪᴍᴜʟᴀᴛɪᴏɴ ᴄᴏᴍᴘʟᴇᴛᴇ\nsʏsᴛᴇᴍ sᴛɪʟʟ ᴏɴʟɪɴᴇ > ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x"},{quoted:m})

 }catch(e){ console.log(e) }
}
}
