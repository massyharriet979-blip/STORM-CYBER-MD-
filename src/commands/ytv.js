const axios = require('axios')

async function getFileSize(url){
 try{
  let res=await axios.head(url)
  let len=res.headers['content-length']
  if(!len) return "ᴜɴᴋɴᴏᴡɴ"
  return (len/1024/1024).toFixed(2)+" ᴍʙs"
 }catch{ return "ᴜɴᴋɴᴏᴡɴ" }
}

module.exports={
name:"ytv",
aliases:["ytmp4","youtubemp4"],
execute: async(sock,m,args)=>{
let query=args.join(" ")
if(!query) return m.reply("ᴜsᴀɢᴇ:.ʏᴛᴠ ᴀʟᴀɴ ᴡᴀʟᴋᴇʀ ғᴀᴅᴇᴅ")

await sock.sendMessage(m.chat,{react:{text:"📺",key:m.key}})

try{
let dlUrl=null, title=query, thumb=null, duration="ᴜɴᴋɴᴏᴡɴ", channel="ᴜɴᴋɴᴏᴡɴ"

try{
 let searchUrl=query.includes("http")? query : `https://api.davidcyriltech.my.id/search/yt?q=${encodeURIComponent(query)}`
 let videoUrl=query
 if(!query.includes("http")){
  let s=await axios.get(searchUrl)
  let first=s.data.result?.[0] || s.data.results?.[0] || s.data[0]
  if(first){
   title=first.title || query
   thumb=first.thumbnail
   channel=first.author || first.channel || channel
   duration=first.duration || duration
   videoUrl=first.url
  }
 }
 let r=await axios.get(`https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`)
 let res=r.data.result || r.data
 dlUrl=res.downloadUrl || res.url || res.videoUrl
 title=res.title || title
 thumb=res.thumbnail || thumb
 duration=res.duration || duration
 channel=res.author || res.channel || channel
}catch(e){}

if(!dlUrl){
 return m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}

let realSize=await getFileSize(dlUrl)

let cap=`╔══『 📺 ʏᴛᴠ ᴍᴅ ᴇɴɢɪɴᴇ📺』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ᴛɪᴛʟᴇ : ${title.slice(0,65)}
║ ★┃ ᴄʜᴀɴɴᴇʟ : ${channel}
║ ★┃ ᴅᴜʀᴀᴛɪᴏɴ : ${duration}
║ ★┃ sɪᴢᴇ : ${realSize}
║ ★┃ ǫᴜᴀʟɪᴛʏ : 720ᴘ ʜᴅ
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

if(thumb){
 await sock.sendMessage(m.chat,{image:{url:thumb},caption:cap},{quoted:m})
}else{
 await sock.sendMessage(m.chat,{text:cap},{quoted:m})
}

await sock.sendMessage(m.chat,{
video:{url:dlUrl},
mimetype:"video/mp4",
fileName:title+".mp4"
},{quoted:m})

}catch(e){
 console.log(e)
 m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}
}
}
