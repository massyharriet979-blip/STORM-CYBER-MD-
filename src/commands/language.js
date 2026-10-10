const fs=require('fs')
const path=require('path')
module.exports={
name:"language",
aliases:["lang","setlang","botlang"],
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

  // ONLY SUBBOT YES
  if(!isOwner &&!isSudo &&!isGroupAdmin){
   return await sock.sendMessage(m.chat,{text:"ǫᴜᴀɴᴛᴜᴍ ᴄʟᴇᴀʀᴀɴᴄᴇ ʀᴇǫᴜɪʀᴇᴅ"},{quoted:m})
  }
  if(isGroupAdmin &&!isOwner &&!isSudo){
   return await sock.sendMessage(m.chat,{text:"ʏᴏᴜ ᴀʀᴇ ʀᴇsᴛʀɪᴄᴛᴇᴅ ᴛᴏ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ"},{quoted:m})
  }
  if(isSudo &&!isOwner){
   return await sock.sendMessage(m.chat,{text:"ʏᴏᴜ ʜᴀᴠᴇ ʟɪᴍɪᴛs ᴛᴏ sᴏᴍᴇ ᴄᴏᴍᴍᴀɴᴅs"},{quoted:m})
  }

  // OWNER ONLY FROM HERE
  let langFile=`./database/lang_${botId}.json`
  let current="ᴇɴ"
  try{ if(fs.existsSync(langFile)){ current=JSON.parse(fs.readFileSync(langFile)).lang || "ᴇɴ" } }catch{}

  let available=["ᴇɴ","ғʀ","ᴀʀ","ʟɢ","ᴇs","sᴡ","ʀᴡ","ʜɪ"]

  let input=(args[0]||"").toLowerCase().replace(/[^a-z]/g,"")

  if(!input){
   return await sock.sendMessage(m.chat,{text:`ʟᴀɴɢᴜᴀɢᴇ sᴇᴛɪɴɢs

ᴄᴜʀʀᴇɴᴛ: ${current.toUpperCase()}
ᴀᴠᴀɪʟᴀʙʟᴇ: ᴇɴ, ғʀ, ᴀʀ, ʟɢ, ᴇs, sᴡ, ʀᴡ, ʜɪ

ᴜsᴀɢᴇ:.ʟᴀɴɢᴜᴀɢᴇ ᴇɴ
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
  }

  let allowed=["en","fr","ar","lg","es","sw","rw","hi"]
  if(!allowed.includes(input)){
   return await sock.sendMessage(m.chat,{text:`ɪɴᴠᴀʟɪᴅ ʟᴀɴɢ. ᴜsᴇ: ${allowed.join(", ")}`},{quoted:m})
  }

  try{
   fs.mkdirSync("./database",{recursive:true})
   fs.writeFileSync(langFile, JSON.stringify({lang:input, updated:Date.now()}))
  }catch(e){}

  await sock.sendMessage(m.chat,{text:`ʟᴀɴɢᴜᴀɢᴇ ᴄʜᴀɴɢᴇᴅ

ᴏʟᴅ: ${current}
ɴᴇᴡ: ${input.toUpperCase()}

ᴛʜɪs ᴀᴘᴘʟɪᴇs ᴏɴʟʏ ᴛᴏ ʏᴏᴜʀ sᴜʙʙᴏᴛ ${botId}
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})

 }catch(e){ console.log(e) }
}
}
