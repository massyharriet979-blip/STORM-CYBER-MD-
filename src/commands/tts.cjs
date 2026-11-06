const fs=require('fs')
const path=require('path')
module.exports={
name:"tts",
aliases:["say","speak","gtts"],
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

  let text=args.join(" ").trim()
  if(!text) return await sock.sendMessage(m.chat,{text:"ᴜsᴀɢᴇ:.ᴛᴛs [ʟᴀɴɢ] ᴛᴇxᴛ\nᴇx:.ᴛᴛs ʜᴇʟʟᴏ ᴡᴏʀʟᴅ\nᴇx:.ᴛᴛs ʟɢ ᴏʟɪ ᴏᴛʏᴀ"},{quoted:m})

  // check if first word is lang code (2 letters)
  let lang="en"
  let parts=text.split(" ")
  if(parts.length>1 && parts[0].length===2){
   lang=parts[0].toLowerCase()
   text=parts.slice(1).join(" ")
  }

  if(text.length>200) text=text.slice(0,200)

  await sock.sendMessage(m.chat,{react:{text:"🔊",key:m.key}})

  // google tts
  let url=`https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&q=${encodeURIComponent(text)}&client=gtx`

  let res=await fetch(url,{
   headers:{
    "User-Agent":"Mozilla/5.0",
    "Referer":"https://translate.google.com/"
   }
  })

  if(!res.ok) throw new Error("tts fetch failed")

  let buffer=Buffer.from(await res.arrayBuffer())

  let tmpPath=path.join("/tmp",`tts_${Date.now()}.mp3`)
  fs.writeFileSync(tmpPath, buffer)

  await sock.sendMessage(m.chat,{
   audio: fs.readFileSync(tmpPath),
   mimetype:"audio/mpeg",
   ptt: true
  },{quoted:m})

  try{ fs.unlinkSync(tmpPath) }catch{}

 }catch(e){
  console.log(e)
  await sock.sendMessage(m.chat,{text:"ᴛᴛs ᴇʀʀᴏʀ, ᴛʀʏ sʜᴏʀᴛᴇʀ ᴛᴇxᴛ"},{quoted:m})
 }
}
}
