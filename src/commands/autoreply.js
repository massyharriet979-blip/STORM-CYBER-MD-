const fs=require('fs')
const path=require('path')

module.exports={
name:"autoreply",
aliases:["ar"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]
  if(sender!==botId) return await sock.sendMessage(m.chat,{text:"ᴏᴡɴᴇʀ ᴏɴʟʏ"},{quoted:m})

  let file=path.join('./database','vars.json')
  let data={}
  try{ if(fs.existsSync(file)) data=JSON.parse(fs.readFileSync(file)) }catch{ data={} }

  let opt=(args[0]||"").toLowerCase()

  if(opt==="off"||opt==="disable"||!opt){
    data.AUTOREPLY="false"
    fs.mkdirSync('./database',{recursive:true})
    fs.writeFileSync(file, JSON.stringify(data,null,2))
    return await sock.sendMessage(m.chat,{text:"❌ THE OWNER DISABLED THIS COMMAND\n⚠️ ITS OUT OF ACTION\n🚫 NO NEED TO USE"},{quoted:m})
  }

  if(opt==="on"||opt==="enable"){
    data.AUTOREPLY="true"
    fs.writeFileSync(file, JSON.stringify(data,null,2))
    return await sock.sendMessage(m.chat,{text:"✅ AUTOREPLY ENABLED"},{quoted:m})
  }

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
