const fs=require('fs')
const path=require('path')
module.exports={
name:"setimage",
aliases:["setmenu","setthumb","setimg"],
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

  let imgPath=`./database/menu_${botId}.jpg`
  let hasQuotedImg = m.quoted && (m.quoted.mtype==="imageMessage" || m.quoted.msg?.mimetype?.includes("image"))

  if(hasQuotedImg){
   let buffer=await sock.downloadMediaMessage(m.quoted)
   fs.mkdirSync("./database",{recursive:true})
   fs.writeFileSync(imgPath, buffer)
   return await sock.sendMessage(m.chat,{text:`ᴍᴇɴᴜ ɪᴍᴀɢᴇ ᴄʜᴀɴɢᴇᴅ\nғᴏʀ sᴜʙʙᴏᴛ: ${botId}\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`,},{quoted:m})
  }

  let url=args[0]
  if(url && url.startsWith("http")){
   let res=await fetch(url)
   let buf=Buffer.from(await res.arrayBuffer())
   fs.mkdirSync("./database",{recursive:true})
   fs.writeFileSync(imgPath, buf)
   return await sock.sendMessage(m.chat,{text:`ᴍᴇɴᴜ ɪᴍᴀɢᴇ ᴄʜᴀɴɢᴇᴅ ғʀᴏᴍ ᴜʀʟ\nғᴏʀ sᴜʙʙᴏᴛ: ${botId}\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
  }

  return await sock.sendMessage(m.chat,{text:`ᴜsᴀɢᴇ:\n1. ʀᴇᴘʟʏ ᴛᴏ ɪᴍᴀɢᴇ ᴡɪᴛʜ.sᴇᴛɪᴍᴀɢᴇ\n2..sᴇᴛɪᴍᴀɢᴇ https://link.jpg\n\nᴄᴜʀʀᴇɴᴛ: ${fs.existsSync(imgPath)? "sᴇᴛ": "ɴᴏᴛ sᴇᴛ (ᴅᴇғᴀᴜʟᴛ)"}`},{quoted:m})

 }catch(e){ console.log(e); await sock.sendMessage(m.chat,{text:"sᴇᴛɪᴍᴀɢᴇ ғᴀɪʟᴇᴅ"},{quoted:m}) }
}
}
