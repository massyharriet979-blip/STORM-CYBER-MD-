const axios = require('axios')

module.exports={
name:"pinterest",
aliases:["pin","pint"],
execute: async(sock,m,args)=>{
let query=args.join(" ")
if(!query) return m.reply("ᴜsᴀɢᴇ:.ᴘɪɴᴛᴇʀᴇsᴛ ᴀɴɪᴍᴇ ɢɪʀʟ")

await sock.sendMessage(m.chat,{react:{text:"📌",key:m.key}})

try{
let results=[]

try{
 let r=await axios.get(`https://api.davidcyriltech.my.id/search/pinterest?q=${encodeURIComponent(query)}`)
 results=r.data.result || r.data.results || r.data || []
}catch{}

if(!results.length){
 try{
  let r2=await axios.get(`https://api.ryzendesu.vip/api/search/pinterest?query=${encodeURIComponent(query)}`)
  results=r2.data?.result || r2.data || []
 }catch{}
}

if(!results.length){
 return m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}

// Pick 5 random images
let picks=results.sort(()=>0.5-Math.random()).slice(0,5)

for(let i=0;i<picks.length;i++){
 let url=picks[i]?.image || picks[i]?.url || picks[i]?.pin || picks[i]
 if(!url) continue

 let cap=`╔══『 📌 ᴘɪɴᴛᴇʀᴇsᴛ ᴍᴅ ᴇɴɢɪɴᴇ📌』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ǫᴜᴇʀʏ : ${query}
║ ★┃ ɴᴜᴍʙᴇʀ : ${i+1}/${picks.length}
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★┃ sᴏᴜʀᴄᴇ : ᴘɪɴᴛᴇʀᴇsᴛ
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

 await sock.sendMessage(m.chat,{image:{url:url},caption:cap},{quoted:m})
 // small delay
 await new Promise(r=>setTimeout(r,800))
}

}catch(e){
 console.log(e)
 m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}
}
}
