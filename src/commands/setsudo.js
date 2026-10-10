const fs=require('fs')
module.exports={
name:"setsudo",
aliases:["listsudo","sudo","sudolist"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]
  if(sender!==botId) return await sock.sendMessage(m.chat,{text:"ǫᴜᴀɴᴛᴜᴍ ᴄʟᴇᴀʀᴀɴᴄᴇ ʀᴇǫᴜɪʀᴇᴅ"},{quoted:m})

  let file=`./database/sudo_${botId}.json`
  // main bot fallback
  if(!fs.existsSync(file) && fs.existsSync("./database/sudo.json") && botId.length<12) file="./database/sudo.json"
  fs.mkdirSync("./database",{recursive:true})
  let list=[]
  try{ if(fs.existsSync(file)) list=JSON.parse(fs.readFileSync(file)) }catch{}
  if(!Array.isArray(list)) list=[]

  let sub=args[0]?.toLowerCase()||""

  if(!sub){
    let txt=`sᴜᴅᴏ ᴍᴀɴᴀɢᴇʀ ⚙️\n\nᴛᴏᴛᴀʟ: ${list.length}\nғɪʟᴇ: ${file.split("/").pop()}\n\n`
    if(list.length===0) txt+=`ɴᴏ sᴜᴅᴏ ʏᴇᴛ\n`
    else{
      list.forEach((n,i)=>{ txt+=`${i+1}. ${n}\n` })
      txt+=`\n`
    }
    txt+=`ᴜsᴀɢᴇ:\n.setsudo add 2567...\n.setsudo del 2567... / tag / reply\n.setsudo clear\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`
    let mentions=list.map(n=>n+"@s.whatsapp.net")
    return await sock.sendMessage(m.chat,{text:txt, mentions},{quoted:m})
  }

  if(sub==="add"){
    let target=null
    if(m.mentionedJid?.length) target=m.mentionedJid[0].split("@")[0]
    else if(m.quoted) target=m.quoted.sender.split("@")[0]
    else if(args[1]) target=args[1].replace(/[^0-9]/g,"")
    if(!target || target.length<10) return await sock.sendMessage(m.chat,{text:"ᴘʀᴏᴠɪᴅᴇ ɴᴜᴍʙᴇʀ\n.setsudo add 2567..."},{quoted:m})
    if(list.includes(target)) return await sock.sendMessage(m.chat,{text:`@${target} ᴀʟʀᴇᴀᴅʏ sᴜᴅᴏ`, mentions:[target+"@s.whatsapp.net"]},{quoted:m})
    list.push(target)
    fs.writeFileSync(file, JSON.stringify(list))
    return await sock.sendMessage(m.chat,{text:`ᴀᴅᴅᴇᴅ ✅ @${target}`, mentions:[target+"@s.whatsapp.net"]},{quoted:m})
  }

  if(sub==="del"||sub==="remove"||sub==="rm"){
    let target=null
    if(m.mentionedJid?.length) target=m.mentionedJid[0].split("@")[0]
    else if(m.quoted) target=m.quoted.sender.split("@")[0]
    else if(args[1]) target=args[1].replace(/[^0-9]/g,"")
    if(!target) return await sock.sendMessage(m.chat,{text:"ᴘʀᴏᴠɪᴅᴇ ɴᴜᴍʙᴇʀ\n.setsudo del 256..."},{quoted:m})
    let newList=list.filter(x=>x!==target)
    fs.writeFileSync(file, JSON.stringify(newList))
    return await sock.sendMessage(m.chat,{text:`ʀᴇᴍᴏᴠᴇᴅ ❌ @${target}`, mentions:[target+"@s.whatsapp.net"]},{quoted:m})
  }

  if(sub==="clear"){
    fs.writeFileSync(file, JSON.stringify([]))
    return await sock.sendMessage(m.chat,{text:"sᴜᴅᴏ ʟɪsᴛ ᴄʟᴇᴀʀᴇᴅ ✅"},{quoted:m})
  }

  await sock.sendMessage(m.chat,{text:"ɪɴᴠᴀʟɪᴅ ᴜsᴇ.setsudo to see help"},{quoted:m})

 }catch(e){ console.log(e) }
}
}
