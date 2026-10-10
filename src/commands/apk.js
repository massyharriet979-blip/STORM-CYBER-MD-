const axios = require('axios')
const fs = require('fs')

function getOwnerAndSudo(sock,m){
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0] || ""
  let sender=m.sender.split("@")[0]

  let sudoList=[]
  if(fs.existsSync("./database/sudo.json")){
   try{ sudoList=JSON.parse(fs.readFileSync("./database/sudo.json")) }catch{}
  }
  // also check per-subbot sudo if you have
  let subSudoPath=`./database/sudo_${botId}.json`
  if(fs.existsSync(subSudoPath)){
   try{ let extra=JSON.parse(fs.readFileSync(subSudoPath)); sudoList=sudoList.concat(extra) }catch{}
  }

  let isBotOwner = sender===botId
  let isSudo = sudoList.includes(sender) || sudoList.includes(m.sender)

  // Also if global config owner
  try{
   let config=require("../../config")
   if(config.owner && config.owner.includes(sender)) isSudo=true
  }catch{}

  return {isBotOwner, isSudo, botId, sender}
 }catch(e){ return {isBotOwner:false,isSudo:false} }
}

module.exports={
name:"apk",
execute: async(sock,m,args)=>{
let query=args.join(" ")
if(!query) return m.reply("ᴜsᴀɢᴇ:.ᴀᴘᴋ ᴛᴇʀᴍᴜx")

// CHECK FOR SUBBOT OWNER
let {isBotOwner, isSudo} = getOwnerAndSudo(sock,m)

if(!isBotOwner &&!isSudo){
 return m.reply("ǫᴜᴀɴᴛᴜᴍ ᴄʟᴇᴀʀᴀɴᴄᴇ ʀᴇǫᴜɪʀᴇᴅ")
}

await sock.sendMessage(m.chat,{react:{text:"📦",key:m.key}})

try{
let dlUrl=null, appName=query, size="ᴜɴᴋɴᴏᴡɴ", thumb=null, version="ʟᴀᴛᴇsᴛ"

try{
let r=await axios.get(`https://api.davidcyriltech.my.id/download/apk?app=${encodeURIComponent(query)}`)
let res=r.data.result || r.data
dlUrl=res.downloadUrl || res.url || res.link || res.download
appName=res.name || res.appName || query
size=res.size || size
thumb=res.thumbnail || res.icon
version=res.version || version
}catch{}

if(!dlUrl){
 try{
  let r2=await axios.get(`https://api.ryzendesu.vip/api/downloader/apk?query=${encodeURIComponent(query)}`)
  dlUrl=r2.data?.url || r2.data?.download
  appName=r2.data?.name || query
 }catch{}
}

if(!dlUrl){
 return m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}

let cap=`╔══『 📦 ᴀᴘᴋ ᴍᴅ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ📦』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ᴀᴘᴘ ɴᴀᴍᴇ : ${appName}
║ ★┃ ᴠᴇʀsɪᴏɴ : ${version}
║ ★┃ sɪᴢᴇ : ${size}
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★┃ ᴀᴄᴄᴇss : ᴏᴡɴᴇʀ+ sᴜᴅᴏ ᴏɴʟʏ
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

if(thumb){
 await sock.sendMessage(m.chat,{image:{url:thumb},caption:cap},{quoted:m})
}else{
 await sock.sendMessage(m.chat,{text:cap},{quoted:m})
}

await sock.sendMessage(m.chat,{
document:{url:dlUrl},
mimetype:"application/vnd.android.package-archive",
fileName: appName+".apk"
},{quoted:m})

}catch(e){
 console.log(e)
 m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}
}
}
