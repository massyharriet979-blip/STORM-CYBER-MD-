const fs=require('fs')
module.exports={
name:"mention",
aliases:["tagall","hidetag","mentionall","tag"],
execute: async(sock,m,args)=>{
 try{
  if(!m.chat.endsWith("@g.us")) return await sock.sendMessage(m.chat,{text:"ɢʀᴏᴜᴘ ᴏɴʟʏ"},{quoted:m})

  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]

  // group admins
  let meta=await sock.groupMetadata(m.chat)
  let participants=meta.participants||[]
  let isGroupAdmin=participants.find(p=>p.id===m.sender && (p.admin==="admin"||p.admin==="superadmin"))
  let isBotOwner=sender===botId

  // sudo check
  let isSudo=false
  try{
    let files=["./database/sudo.json","./database/sudos.json","./config.json"]
    for(let f of files){
      if(fs.existsSync(f)){
        let d=JSON.parse(fs.readFileSync(f))
        let list=Array.isArray(d)?d:d.sudo||d.owners||d.owner||[]
        if(list.map(x=>String(x).replace(/[^0-9]/g,"")).includes(sender)) isSudo=true
      }
    }
  }catch{}

  if(!isBotOwner &&!isGroupAdmin &&!isSudo){
    return await sock.sendMessage(m.chat,{text:"ᴀᴅᴍɪɴ / sᴜᴅᴏ ᴏɴʟʏ"},{quoted:m})
  }

  let text=args.join(" ")||""
  let msgText=text? `${text}\n\n` : ""

  let mentions=[]
  let list=""
  for(let p of participants){
    mentions.push(p.id)
    list+=`◈ @${p.id.split("@")[0]}\n`
  }

  let final=`${msgText}╭━─━─━─━─❰ ᴍᴇɴᴛɪᴏɴ ❱─━─━─━─━╮\n${list}╰━━━━━━━━━━━━━━━╯\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

  await sock.sendMessage(m.chat,{text:final, mentions:mentions},{quoted:m})

 }catch(e){ console.log(e); await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
