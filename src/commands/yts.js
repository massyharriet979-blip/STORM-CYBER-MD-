const axios = require('axios')

module.exports={
name:"yts",
aliases:["ytsearch","youtubesearch"],
execute: async(sock,m,args)=>{
let query=args.join(" ")
if(!query) return m.reply("ᴜsᴀɢᴇ:.ʏᴛs ᴀʟᴀɴ ᴡᴀʟᴋᴇʀ ғᴀᴅᴇᴅ")

await sock.sendMessage(m.chat,{react:{text:"🔍",key:m.key}})

try{
let results=[]
try{
 let r=await axios.get(`https://api.davidcyriltech.my.id/search/yt?q=${encodeURIComponent(query)}`)
 results=r.data.result || r.data.results || r.data || []
}catch{}

if(!results.length){
 try{
  let r2=await axios.get(`https://api.ryzendesu.vip/api/search/youtube?query=${encodeURIComponent(query)}`)
  results=r2.data || []
 }catch{}
}

if(!results.length){
 return m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}

let top10=results.slice(0,10)

let text=`╔══『 🔍 ʏᴛs ᴍᴅ sᴇᴀʀᴄʜ🔍』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ǫᴜᴇʀʏ : ${query}
║ ★┃ ʀᴇsᴜʟᴛs : ${top10.length}/10
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*\n\n`

top10.forEach((v,i)=>{
 let title=v.title || v.name || "ᴜɴᴋɴᴏᴡɴ"
 let duration=v.duration || v.timestamp || "ᴜɴᴋɴᴏᴡɴ"
 let channel=v.author || v.channel || v.uploader || "ᴜɴᴋɴᴏᴡɴ"
 let url=v.url || v.link
 text+=`*${i+1}. ${title.slice(0,60)}*\n`
 text+=` ᴄʜᴀɴɴᴇʟ: ${channel}\n`
 text+=` ᴅᴜʀᴀᴛɪᴏɴ: ${duration}\n`
 text+=` ʟɪɴᴋ: ${url}\n\n`
})

text+=`> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x
ʀᴇᴘʟʏ ᴡɪᴛʜ.ᴠɪᴅᴇᴏ <ʟɪɴᴋ> ᴏʀ.ᴘʟᴀʏ <ʟɪɴᴋ>`

// Send thumbnail of first result
let thumb=top10[0]?.thumbnail || top10[0]?.image

if(thumb){
 await sock.sendMessage(m.chat,{image:{url:thumb},caption:text},{quoted:m})
}else{
 await sock.sendMessage(m.chat,{text:text},{quoted:m})
}

}catch(e){
 console.log(e)
 m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}
}
}
