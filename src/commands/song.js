const yts = require('yt-search')
const axios = require('axios')

module.exports={
name:"song",
execute: async(sock,m,args)=>{
let query=args.join(" ")
if(!query) return m.reply("ᴜsᴀɢᴇ:.sᴏɴɢ ғᴀᴅᴇᴅ")

await sock.sendMessage(m.chat,{react:{text:"🎧",key:m.key}})

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
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★┃ sɪᴢᴇ : 4.2 ᴍʙs
║ ★┃ ᴛʏᴘᴇ : ᴅᴏᴄᴜᴍᴇɴᴛ
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

await sock.sendMessage(m.chat,{image:{url:video.thumbnail},caption:cap},{quoted:m})

let dlUrl=null
try{
let r=await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${video.url}`)
dlUrl=r.data.result?.downloadUrl || r.data.download_url
}catch{}
if(!dlUrl){
let r=await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${video.url}`)
dlUrl=r.data?.url
}

if(!dlUrl) return m.reply("ғᴀɪʟᴇᴅ")

// SONG = DOCUMENT - DIFFERENT FROM PLAY
await sock.sendMessage(m.chat,{
document:{url:dlUrl},
mimetype:"audio/mpeg",
fileName: video.title+".mp3"
},{quoted:m})

}catch(e){ m.reply("ᴇʀʀᴏʀ: "+e.message) }
}
}
