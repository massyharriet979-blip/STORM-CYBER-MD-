const yts = require('yt-search')
const axios = require('axios')

module.exports={
name:"play",
execute: async(sock,m,args)=>{
let query=args.join(" ")
if(!query) return m.reply("ᴜsᴀɢᴇ:.ᴘʟᴀʏ ғᴀᴅᴇᴅ")

await sock.sendMessage(m.chat,{react:{text:"🎵",key:m.key}})

try{
let search=await yts(query)
let video=search.videos[0]
if(!video) return m.reply("ɴᴏ ʀᴇsᴜʟᴛs")

let cap=`╔══『 🛡️ ᴄʏʙᴇʀ ᴍᴅ ᴍᴜsɪᴄ🛡️』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ᴛɪᴛʟᴇ : ${video.title}
║ ★┃ ᴀʀᴛɪsᴛ : ${video.author.name}
║ ★┃ ᴄʜᴀɴɴᴇʟ : ${video.author.name}
║ ★┃ ᴅᴜʀᴀᴛɪᴏɴ : ${video.timestamp}
║ ★┃ ᴠɪᴇᴡs : ${video.views.toLocaleString()}
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★┃ sɪᴢᴇ : 3.5 ᴍʙs
║ ★┃ ᴅᴀᴛᴇ : ${new Date().toLocaleDateString()}
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

await sock.sendMessage(m.chat,{image:{url:video.thumbnail},caption:cap},{quoted:m})

let dlUrl=null

// TRY 1
try{
let r1=await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${video.url}`)
dlUrl=r1.data.result?.downloadUrl || r1.data.download_url
}catch{}

// TRY 2 - backup api
if(!dlUrl){
try{
let r2=await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${video.url}`)
dlUrl=r2.data?.url || r2.data?.downloadUrl
}catch{}
}

// TRY 3 - another backup
if(!dlUrl){
try{
let r3=await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${video.url}`)
dlUrl=r3.data?.result?.download || r3.data?.download
}catch{}
}

if(!dlUrl) return m.reply("ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇᴛ ᴀᴜᴅɪᴏ ʟɪɴᴋ, ᴛʀʏ ᴀɢᴀɪɴ")

await sock.sendMessage(m.chat,{
audio:{url:dlUrl},
mimetype:"audio/mpeg",
fileName: video.title+".mp3",
ptt:false
},{quoted:m})

}catch(e){
console.log(e)
m.reply("ᴇʀʀᴏʀ: "+e.message)
}
}
}
