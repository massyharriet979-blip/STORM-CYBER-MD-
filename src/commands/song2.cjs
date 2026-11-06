const yts = require('yt-search')
const axios = require('axios')

async function getFileSize(url){
 try{
  let res=await axios.head(url)
  let len=res.headers['content-length']
  if(!len) return "ᴜɴᴋɴᴏᴡɴ"
  let mb=(len/1024/1024).toFixed(2)
  return `${mb} ᴍʙs`
 }catch{
  return "ᴜɴᴋɴᴏᴡɴ"
 }
}

module.exports={
name:"song2",
execute: async(sock,m,args)=>{
let query=args.join(" ")
if(!query) return m.reply("ᴜsᴀɢᴇ:.sᴏɴɢ2 ғᴀᴅᴇᴅ")

await sock.sendMessage(m.chat,{react:{text:"🎧",key:m.key}})

try{
let search=await yts(query)
let video=search.videos[0]
if(!video) return m.reply("ɴᴏ ʀᴇsᴜʟᴛs")

let dlUrl=null

// TRY 1
try{
let r1=await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${video.url}`)
dlUrl=r1.data.result?.downloadUrl || r1.data.download_url || r1.data.result?.url
}catch(e){}

// TRY 2
if(!dlUrl){
try{
let r2=await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${video.url}`)
dlUrl=r2.data?.url || r2.data?.downloadUrl
}catch(e){}
}

// TRY 3
if(!dlUrl){
try{
let r3=await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${video.url}`)
dlUrl=r3.data?.result?.download || r3.data?.download
}catch(e){}
}

if(!dlUrl){
return m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}

let realSize=await getFileSize(dlUrl)

let cap=`╔══『 🛡️ ᴄʏʙᴇʀ ᴍᴅ ᴍᴜsɪᴄ🛡️』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ᴛɪᴛʟᴇ : ${video.title}
║ ★┃ ᴀʀᴛɪsᴛ : ${video.author.name}
║ ★┃ ᴄʜᴀɴɴᴇʟ : ${video.author.name}
║ ★┃ ᴅᴜʀᴀᴛɪᴏɴ : ${video.timestamp}
║ ★┃ ᴠɪᴇᴡs : ${video.views.toLocaleString()}
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★┃ sɪᴢᴇ : ${realSize}
║ ★┃ ᴅᴀᴛᴇ : ${new Date().toLocaleDateString()}
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

await sock.sendMessage(m.chat,{image:{url:video.thumbnail},caption:cap},{quoted:m})

await sock.sendMessage(m.chat,{
audio:{url:dlUrl},
mimetype:"audio/mpeg",
fileName: video.title+".mp3"
},{quoted:m})

}catch(e){
console.log(e)
m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}
}
}
