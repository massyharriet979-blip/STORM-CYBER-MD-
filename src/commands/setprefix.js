const fs=require('fs')
module.exports={
name:"setprefix",
aliases:["prefix","setpref"],
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

  let prefFile=`./database/prefix_${botId}.json`
  let current="."
  try{ if(fs.existsSync(prefFile)) current=JSON.parse(fs.readFileSync(prefFile)).prefix }catch{}

  let newPref=args[0]
  if(!newPref){
   return await sock.sendMessage(m.chat,{text:`ᴘʀᴇғɪx sᴇᴛɪɴɢs\n\nᴄᴜʀʀᴇɴᴛ: ${current}\n\nᴜsᴀɢᴇ:.sᴇᴛᴘʀᴇғɪx!\nᴇx:.sᴇᴛᴘʀᴇғɪx.\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
  }

  if(newPref.length>2) return await sock.sendMessage(m.chat,{text:"ᴘʀᴇғɪx ᴍᴜsᴛ ʙᴇ 1 ᴄʜᴀʀ:.! # /"},{quoted:m})

  fs.mkdirSync("./database",{recursive:true})
  fs.writeFileSync(prefFile, JSON.stringify({prefix:newPref}))

  await sock.sendMessage(m.chat,{text:`ᴘʀᴇғɪx ᴄʜᴀɴɢᴇᴅ\n\nᴏʟᴅ: ${current}\nɴᴇᴡ: ${newPref}\n\nғᴏʀ sᴜʙʙᴏᴛ: ${botId}\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})

 }catch(e){ console.log(e) }
}
}
