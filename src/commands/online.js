const fs=require('fs')
module.exports={
name:"online",
aliases:["offline","antiban","presence","onlineoff"],
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

  // OWNER - ACTUAL ANTIBAN WORK
  let mode=(args[0]||"off").toLowerCase()

  if(mode==="on"||mode==="online"){
   await sock.sendPresenceUpdate("available", m.chat)
   // save status
   try{ fs.writeFileSync(`./database/presence_${botId}.json`, JSON.stringify({presence:"online"})) }catch{}
   return await sock.sendMessage(m.chat,{text:"ᴏɴʟɪɴᴇ ᴍᴏᴅᴇ ᴀᴄᴛɪᴠᴀᴛᴇᴅ\n\nᴛʜᴀɴx ғᴏʀ ᴜsɪɴɢ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ\nɪᴛ ᴡɪʟʟ ʀᴇᴅᴜᴄᴇ ᴏɴ ᴛʜᴇ ʀɪsᴋs ᴏғ ɢᴇᴛᴛɪɴɢ ʙᴜɴs\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x"},{quoted:m})
  }else{
   // OFF = SAFER - hide online, no auto typing/recording
   await sock.sendPresenceUpdate("unavailable", m.chat)
   try{ fs.writeFileSync(`./database/presence_${botId}.json`, JSON.stringify({presence:"offline"})) }catch{}
   return await sock.sendMessage(m.chat,{text:"ᴏғғʟɪɴᴇ ᴍᴏᴅᴇ ᴀᴄᴛɪᴠᴀᴛᴇᴅ\nᴀᴜᴛᴏ-ᴛʏᴘɪɴɢ / ᴀᴜᴛᴏ-ʀᴇᴄᴏʀᴅɪɴɢ ᴅɪsᴀʙʟᴇᴅ\n\nᴛʜᴀɴx ғᴏʀ ᴜsɪɴɢ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ\nɪᴛ ᴡɪʟʟ ʀᴇᴅᴜᴄᴇ ᴏɴ ᴛʜᴇ ʀɪsᴋs ᴏғ ɢᴇᴛᴛɪɴɢ ʙᴜɴs\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x"},{quoted:m})
  }

 }catch(e){ console.log(e) }
}
}
