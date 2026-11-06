module.exports={
name:"delete",
aliases:["del","d","revoke"],
execute: async(sock,m,args)=>{
 try{
  if(!m.chat.endsWith("@g.us")) return await sock.sendMessage(m.chat,{text:"ɢʀᴏᴜᴘ ᴏɴʟʏ"},{quoted:m})

  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]

  let meta=await sock.groupMetadata(m.chat)
  let participants=meta.participants||[]
  let isGroupAdmin=participants.find(p=>p.id===m.sender && (p.admin==="admin"||p.admin==="superadmin"))
  let isBotOwner=sender===botId

  // sudo check
  let isSudo=false
  try{
    const fs=require('fs')
    let files=["./database/sudo.json","./database/sudos.json"]
    for(let f of files){
      if(fs.existsSync(f)){
        let d=JSON.parse(fs.readFileSync(f))
        let list=Array.isArray(d)?d:d.sudo||[]
        if(list.map(x=>String(x).replace(/[^0-9]/g,"")).includes(sender)) isSudo=true
      }
    }
  }catch{}

  if(!isBotOwner &&!isGroupAdmin &&!isSudo){
    return await sock.sendMessage(m.chat,{text:"ᴀᴅᴍɪɴ / sᴜᴅᴏ ᴏɴʟʏ"},{quoted:m})
  }

  if(!m.quoted) return await sock.sendMessage(m.chat,{text:"ʀᴇᴘʟʏ ᴛᴏ ᴍsɢ ᴛᴏ ᴅᴇʟᴇᴛᴇ\nᴜsᴀɢᴇ:.ᴅᴇʟ (reply)"},{quoted:m})

  // bot must be admin to delete others msgs
  let botParticipant=participants.find(p=>p.id.includes(botId))
  if(!botParticipant || (botParticipant.admin!=="admin" && botParticipant.admin!=="superadmin")){
    return await sock.sendMessage(m.chat,{text:"ɪ ɴᴇᴇᴅ ᴀᴅᴍɪɴ ᴛᴏ ᴅᴇʟᴇᴛᴇ"},{quoted:m})
  }

  await sock.sendMessage(m.chat,{delete:m.quoted.fakeObj?.key || m.quoted.key})

 }catch(e){
  console.log(e)
  // fallback delete quoted key directly
  try{ await sock.sendMessage(m.chat,{delete:m.quoted.key}) }catch{}
 }
}
}
