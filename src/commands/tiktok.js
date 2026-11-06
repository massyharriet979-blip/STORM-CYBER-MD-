const axios = require('axios')

module.exports={
name:"tiktok",
aliases:["tt","tiktokdl"],
execute: async(sock,m,args)=>{
let url=args[0]
if(!url) return m.reply("ᴜsᴀɢᴇ:.ᴛɪᴋᴛᴏᴋ https://vt.tiktok.com/...")

await sock.sendMessage(m.chat,{react:{text:"🎬",key:m.key}})

try{
let dlUrl=null, title="ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ", author="ᴜɴᴋɴᴏᴡɴ", thumb=null

// TRY 1
try{
let r1=await axios.get(`https://api.davidcyriltech.my.id/download/tiktok?url=${url}`)
let res=r1.data.result || r1.data
dlUrl=res.video || res.downloadUrl || res.nowm || res.no_watermark || res.hd
title=res.title || res.description || title
author=res.author || res.username || author
thumb=res.thumbnail
}catch(e){}

// TRY 2 - backup
if(!dlUrl){
try{
let r2=await axios.get(`https://api.ryzendesu.vip/api/downloader/tiktok?url=${url}`)
dlUrl=r2.data?.video?.noWatermark || r2.data?.video?.nowm || r2.data?.url
title=r2.data?.title || title
author=r2.data?.author?.nickname || author
}catch(e){}
}

// TRY 3
if(!dlUrl){
try{
let r3=await axios.get(`https://api.dreaded.site/api/tiktok?url=${url}`)
dlUrl=r3.data?.result?.video || r3.data?.download
}catch(e){}
}

if(!dlUrl){
return m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}

let cap=`╔══『 🎬 ᴛɪᴋᴛᴏᴋ ᴍᴅ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ🎬』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ᴛɪᴛʟᴇ : ${title.slice(0,60)}
║ ★┃ ᴀᴜᴛʜᴏʀ : ${author}
║ ★┃ ǫᴜᴀʟɪᴛʏ : ɴᴏ ᴡᴀᴛᴇʀᴍᴀʀᴋ
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★┃ sᴏᴜʀᴄᴇ : ᴛɪᴋᴛᴏᴋ
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

await sock.sendMessage(m.chat,{
video:{url:dlUrl},
caption:cap,
mimetype:"video/mp4"
},{quoted:m})

}catch(e){
console.log(e)
m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}
}
}
