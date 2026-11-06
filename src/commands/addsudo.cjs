const fs=require('fs')
module.exports={
name:"addsudo",
aliases:["addmod","setsudo","sudoadd"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]

  if(sender!==botId){
   // check global sudo? no, only owner can addsudo
   let sudoList=[]
   try{ if(fs.existsSync("./database/sudo.json")) sudoList=JSON.parse(fs.readFileSync("./database/sudo.json")) }catch{}
   try{ if(fs.existsSync(`./database/sudo_${botId}.json`)){ let ex=JSON.parse(fs.readFileSync(`./database/sudo_${botId}.json`)); sudoList=sudoList.concat(ex) } }catch{}
   if(!sudoList.includes(sender)){
    // block admin/local/sudo - owner only
    if(m.isGroup){
     try{
      let meta=await sock.groupMetadata(m.chat)
      let admins=meta.participants.filter(p=>p.admin!==null).map(a=>a.id.split("@")[0])
      if(admins.includes(sender)) return await sock.sendMessage(m.chat,{text:"ʏᴏᴜ ᴀʀᴇ ʀᴇsᴛʀɪᴄᴛᴇᴅ ᴛᴏ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ"},{quoted:m})
     }catch{}
    }
    return await sock.sendMessage(m.chat,{text:"ǫᴜᴀɴᴛᴜᴍ ᴄʟᴇᴀʀᴀɴᴄᴇ ʀᴇǫᴜɪʀᴇᴅ"},{quoted:m})
   }else{
    return await sock.sendMessage(m.chat,{text:"ʏᴏᴜ ʜᴀᴠᴇ ʟɪᴍɪᴛs ᴛᴏ sᴏᴍᴇ ᴄᴏᴍᴍᴀɴᴅs"},{quoted:m})
   }
  }

  let target=null
  if(m.mentionedJid && m.mentionedJid.length>0){
    target=m.mentionedJid[0].split("@")[0]
  }else if(m.quoted){
    target=m.quoted.sender.split("@")[0]
  }else if(args[0]){
    target=args[0].replace(/[^0-9]/g,"")
  }

  if(!target || target.length<10){
    return await sock.sendMessage(m.chat,{text:"ᴜsᴀɢᴇ:.ᴀᴅᴅsᴜᴅᴏ 2567xxxxxxx\nᴏʀ ʀᴇᴘʟʏ/ᴛᴀɢ ᴜsᴇʀ"},{quoted:m})
  }
  if(target===botId) return await sock.sendMessage(m.chat,{text:"ᴏᴡɴᴇʀ ᴀʟʀᴇᴀᴅʏ sᴜᴅᴏ"},{quoted:m})

  let file=`./database/sudo_${botId}.json`
  if(botId=== (process.env.MAIN_NUMBER||"").replace(/[^0-9]/g,"") ||!fs.existsSync(`./src/database/session/creds.json`)){
    // main bot uses global
    file=`./database/sudo.json`
  }
  // for subbots, always use sub file
  if(!file.includes("sudo_")) file=`./database/sudo_${botId}.json`

  let list=[]
  try{ if(fs.existsSync(file)) list=JSON.parse(fs.readFileSync(file)) }catch{}
  if(!Array.isArray(list)) list=[]

  if(list.includes(target)){
    return await sock.sendMessage(m.chat,{text:`@${target} ᴀʟʀᴇᴀᴅʏ sᴜᴅᴏ ✅`, mentions:[target+"@s.whatsapp.net"]},{quoted:m})
  }

  list.push(target)
  fs.mkdirSync("./database",{recursive:true})
  fs.writeFileSync(file, JSON.stringify(list))

  await sock.sendMessage(m.chat,{text:`sᴜᴅᴏ ᴀᴅᴅᴇᴅ ✅\n@${target} ɪs ɴᴏᴡ sᴜᴅᴏ\nғɪʟᴇ: ${file.split("/").pop()}\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[target+"@s.whatsapp.net"]},{quoted:m})

 }catch(e){ console.log(e) }
}
}
