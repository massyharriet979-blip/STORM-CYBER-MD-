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
name:"video",
aliases:["ytvideo","ytmp4"],
execute: async(sock,m,args)=>{
let query=args.join(" ")
if(!query) return m.reply("ᴜsᴀɢᴇ:.ᴠɪᴅᴇᴏ ᴀʟᴀɴ ᴡᴀʟᴋᴇʀ ғᴀᴅᴇᴅ")

await sock.sendMessage(m.chat,{react:{text:"🎥",key:m.key}})

try{
let dlUrl=null, title=query, thumb=null, duration="ᴜɴᴋɴᴏᴡɴ", quality="720ᴘ", channel="ᴜɴᴋɴᴏᴡɴ"

// API 1
try{
let api=`https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(query)}`
if(!query.includes("youtube.com") &&!query.includes("youtu.be")){
 // search first
 let s=await axios.get(`https://api.davidcyriltech.my.id/search/yt?q=${encodeURIComponent(query)}`)
 let first=s.data.result?.[0] || s.data.results?.[0] || s.data[0]
 if(first){
  title=first.title || query
  thumb=first.thumbnail
  channel=first.author || first.channel || channel
  duration=first.duration || duration
  api=`https://api.davidcyriltech.my.id/download/ytmp4?url=${first.url}`
 }
}
let r=await axios.get(api)
let res=r.data.result || r.data
dlUrl=res.downloadUrl || res.url || res.videoUrl || res.dl_url
title=res.title || title
thumb=res.thumbnail || thumb
duration=res.duration || duration
quality=res.quality || quality
channel=res.author || res.channel || channel
}catch(e){}

// API 2 backup
if(!dlUrl){
try{
 let q=query.includes("http")? query : `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
 let r2=await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(q)}`)
 dlUrl=r2.data?.url || r2.data?.downloadUrl || r2.data?.data?.url
}catch{}
}

if(!dlUrl){
 return m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}

let realSize=await getFileSize(dlUrl)

let cap=`╔══『 🎥 ᴠɪᴅᴇᴏ ᴍᴅ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ🎥』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ᴛɪᴛʟᴇ : ${title.slice(0,70)}
║ ★┃ ᴄʜᴀɴɴᴇʟ : ${channel}
║ ★┃ ᴅᴜʀᴀᴛɪᴏɴ : ${duration}
║ ★┃ ǫᴜᴀʟɪᴛʏ : ${quality}
║ ★┃ sɪᴢᴇ : ${realSize}
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★┃ sᴏᴜʀᴄᴇ : ʏᴏᴜᴛᴜʙᴇ
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
fileName: title+".mp4",
caption:"> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x"
},{quoted:m})

}catch(e){
 console.log(e)
 m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}
}
}
