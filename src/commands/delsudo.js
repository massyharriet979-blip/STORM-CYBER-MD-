const fs=require('fs')
module.exports={
name:"delsudo",
aliases:["remsudo","rmsudo","delsudo","removesudo"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]
  if(sender!==botId) return await sock.sendMessage(m.chat,{text:"ǫᴜᴀɴᴛᴜᴍ ᴄʟᴇᴀʀᴀɴᴄᴇ ʀᴇǫᴜɪʀᴇᴅ"},{quoted:m})

  let target=null
  if(m.mentionedJid && m.mentionedJid.length>0){
    target=m.mentionedJid[0].split("@")[0]
  }else if(m.quoted){
    target=m.quoted.sender.split("@")[0]
  }else if(args[0]){
    target=args[0].replace(/[^0-9]/g,"")
  }

  if(!target || target.length<10){
    return await sock.sendMessage(m.chat,{text:"ᴜsᴀɢᴇ:.ᴅᴇʟsᴜᴅᴏ 2567xxxxxxx\nᴏʀ ʀᴇᴘʟʏ/ᴛᴀɢ"},{quoted:m})
  }

  let files=[`./database/sudo_${botId}.json`,`./database/sudo.json`]
  let removed=false
  for(let file of files){
    if(!fs.existsSync(file)) continue
    try{
      let list=JSON.parse(fs.readFileSync(file))
      if(!Array.isArray(list)) continue
      let newList=list.filter(x=>x!==target)
      if(newList.length!==list.length){
        fs.writeFileSync(file, JSON.stringify(newList))
        removed=true
      }
    }catch{}
  }

  if(removed){
    await sock.sendMessage(m.chat,{text:`sᴜᴅᴏ ʀᴇᴍᴏᴠᴇᴅ ❌\n@${target} ɴᴏ ʟᴏɴɢᴇʀ sᴜᴅᴏ\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[target+"@s.whatsapp.net"]},{quoted:m})
  }else{
    await sock.sendMessage(m.chat,{text:`@${target} ɴᴏᴛ ғᴏᴜɴᴅ ɪɴ sᴜᴅᴏ ʟɪsᴛ`, mentions:[target+"@s.whatsapp.net"]},{quoted:m})
  }

 }catch(e){ console.log(e) }
}
}
