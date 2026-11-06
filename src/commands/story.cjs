const axios = require('axios')

module.exports={
name:"story",
execute: async(sock,m,args)=>{
let url=args[0]
if(!url) return m.reply("ᴜsᴀɢᴇ:.sᴛᴏʀʏ https://www.instagram.com/stories/...")

await sock.sendMessage(m.chat,{react:{text:"📸",key:m.key}})

try{
let dlUrl=null, thumb=null, username="ᴜɴᴋɴᴏᴡɴ", type="ᴠɪᴅᴇᴏ"

// TRY API
try{
 let r=await axios.get(`https://api.davidcyriltech.my.id/download/instagram?url=${url}`)
 let res=r.data.result || r.data
 if(Array.isArray(res)){
  dlUrl=res[0]?.url || res[0]?.downloadUrl
 }else{
  dlUrl=res.downloadUrl || res.url || res.video || res.result?.url
 }
 username=res.username || res.author || "sᴛᴏʀʏ"
 thumb=res.thumbnail
}catch{}

if(!dlUrl){
 return m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}

let cap=`╔══『 📸 sᴛᴏʀʏ ᴍᴅ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ📸』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ᴜsᴇʀɴᴀᴍᴇ : ${username}
║ ★┃ ᴛʏᴘᴇ : ${type}
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★┃ sᴏᴜʀᴄᴇ : ɪɴsᴛᴀɢʀᴀᴍ
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

// Check if video or image by url
if(dlUrl.match(/\.(mp4|mov)$/i) || type=="ᴠɪᴅᴇᴏ"){
 await sock.sendMessage(m.chat,{video:{url:dlUrl},caption:cap},{quoted:m})
}else{
 await sock.sendMessage(m.chat,{image:{url:dlUrl},caption:cap},{quoted:m})
}

}catch(e){
 console.log(e)
 m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}
}
}
