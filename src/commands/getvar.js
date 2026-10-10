const fs=require('fs')

module.exports={
name:"getvar",
aliases:["get","vars","allvar","listvar"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]
  if(sender!==botId) return await sock.sendMessage(m.chat,{text:"ᴏᴡɴᴇʀ ᴏɴʟʏ"},{quoted:m})

  let file='./database/vars.json'
  let data={}
  try{ if(fs.existsSync(file)) data=JSON.parse(fs.readFileSync(file)) }catch{ data={} }

  // if specific key
  if(args[0]){
    let key=args[0].toUpperCase()
    if(data[key]){
      return await sock.sendMessage(m.chat,{text:`🔑 ${key}\n📝 ${data[key]}\n\n> ғᴀᴋᴇ ᴠɪᴇᴡ - ɴᴏ ᴅᴇsᴛʀᴜᴄᴛ`},{quoted:m})
    }else{
      return await sock.sendMessage(m.chat,{text:`ɴᴏᴛ ғᴏᴜɴᴅ: ${key}`},{quoted:m})
    }
  }

  // fake safe list - hide sensitive
  let txt=`╭─❍ ɢᴇᴛᴠᴀʀ [ғᴀᴋᴇ sᴀғᴇ] ❍─\n`
  let keys=Object.keys(data)
  if(keys.length===0){
    txt+=`│ ɴᴏ ᴄᴜsᴛᴏᴍ ᴠᴀʀs sᴇᴛ\n`
  }else{
    for(let k of keys){
      let v=String(data[k])
      // mask session-like
      if(k.includes("SESSION")||k.includes("TOKEN")||k.includes("PASS")) v="***ʜɪᴅᴅᴇɴ***"
      txt+=`│ ${k} : ${v}\n`
    }
  }
  txt+=`╰───────────────❍\n\n> ᴜsᴇ.ɢᴇᴛᴠᴀʀ KEY ᴛᴏ ᴠɪᴇᴡ\n>.sᴇᴛᴠᴀʀ KEY VALUE ᴛᴏ sᴇᴛ\n> sᴀғᴇ ᴍᴏᴅᴇ - ɴᴏ ᴅᴇsᴛʀᴜᴄᴛ`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
