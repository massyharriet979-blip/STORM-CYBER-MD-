const fs=require('fs')

module.exports={
name:"delvar",
aliases:["del","rmvar","dvar"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]
  if(sender!==botId) return await sock.sendMessage(m.chat,{text:"ᴏᴡɴᴇʀ ᴏɴʟʏ"},{quoted:m})

  if(!args[0]) return await sock.sendMessage(m.chat,{text:"ᴜsᴀɢᴇ:.ᴅᴇʟᴠᴀʀ KEY\nᴇx:.ᴅᴇʟᴠᴀʀ PREFIX"},{quoted:m})

  let key=args[0].toUpperCase()
  let file='./database/vars.json'
  let data={}
  try{ if(fs.existsSync(file)) data=JSON.parse(fs.readFileSync(file)) }catch{ data={} }

  if(!data[key]) return await sock.sendMessage(m.chat,{text:`ɴᴏᴛ ғᴏᴜɴᴅ: ${key}`},{quoted:m})

  // block destruct of important vars
  let blocked=["SESSION_ID","SESSION","MONGODB","DATABASE_URL"]
  if(blocked.includes(key)){
    return await sock.sendMessage(m.chat,{text:`⚠️ ᴄᴀɴᴛ ᴅᴇʟᴇᴛᴇ ${key}\n> ᴘʀᴏᴛᴇᴄᴛᴇᴅ - ғᴀᴋᴇ sᴀғᴇ ᴍᴏᴅᴇ`},{quoted:m})
  }

  // fake delete - actually deletes from vars.json only, not.env
  delete data[key]
  fs.writeFileSync(file, JSON.stringify(data,null,2))

  await sock.sendMessage(m.chat,{text:`✅ ᴅᴇʟᴇᴛᴇᴅ [ғᴀᴋᴇ sᴀғᴇ]\n\n🔑 ${key}\n> ʀᴇᴍᴏᴠᴇᴅ ғʀᴏᴍ ᴠᴀʀs.ᴊsᴏɴ ᴏɴʟʏ\n> ɴᴏ ᴅᴇsᴛʀᴜᴄᴛ ᴛᴏ.ᴇɴᴠ`},{quoted:m})

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
