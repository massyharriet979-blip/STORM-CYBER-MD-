const yts = require('yt-search')
const axios = require('axios')
module.exports={
name:"play2",
execute: async(sock,m,args)=>{
let query=args.join(" ")
if(!query) return m.reply("ᴜsᴀɢᴇ:.ᴘʟᴀʏ2 ғᴀᴅᴇᴅ")
await sock.sendMessage(m.chat,{react:{text:"🎵",key:m.key}})
try{
let search=await yts(query)
let video=search.videos[0]
if(!video) return m.reply("ɴᴏ ʀᴇsᴜʟᴛs")
let cap=`╔══『 🛡️ ᴄʏʙᴇʀ ᴍᴅ ᴍᴜsɪᴄ🛡️』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ᴛɪᴛʟᴇ : ${video.title}
║ ★┃ ᴀʀᴛɪsᴛ : ${video.author.name}
║ ★┃ ᴅᴜʀᴀᴛɪᴏɴ : ${video.timestamp}
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★┃ sɪᴢᴇ : 3.5 ᴍʙs
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`
await sock.sendMessage(m.chat,{image:{url:video.thumbnail},caption:cap},{quoted:m})
let dl=null
try{
let r=await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${video.url}`)
dl=r.data.result?.downloadUrl || r.data.download_url
}catch{}
if(!dl){
let r=await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${video.url}`)
dl=r.data?.result?.download
}
if(!dl) return m.reply("ғᴀɪʟᴇᴅ")
await sock.sendMessage(m.chat,{audio:{url:dl},mimetype:"audio/mpeg",fileName:video.title+".mp3"},{quoted:m})
}catch(e){ m.reply(e.message) }
}
}
