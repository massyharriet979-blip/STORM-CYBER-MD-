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
name:"spotify",
execute: async(sock,m,args)=>{
let query=args.join(" ")
if(!query) return m.reply("ᴜsᴀɢᴇ:.sᴘᴏᴛɪғʏ ғᴀᴅᴇᴅ")

await sock.sendMessage(m.chat,{react:{text:"🟢",key:m.key}})

try{
let api1=`https://api.davidcyriltech.my.id/download/spotify?url=${query}`
let api2=`https://api.davidcyriltech.my.id/search/spotify?q=${query}`

let track=null, dlUrl=null, thumb=null, title=query, artist="sᴘᴏᴛɪғʏ", duration="ᴜɴᴋɴᴏᴡɴ"

// If user pasted spotify link
if(query.includes("spotify.com")){
 try{
  let r=await axios.get(api1)
  track=r.data.result || r.data
  dlUrl=track.downloadUrl || track.url || track.link
  title=track.title || track.name || query
  artist=track.artist || track.artists || "sᴘᴏᴛɪғʏ"
  thumb=track.thumbnail || track.image || track.cover
  duration=track.duration || "ᴜɴᴋɴᴏᴡɴ"
 }catch{}
}else{
// Search spotify
 try{
  let s=await axios.get(api2)
  let first=s.data.result?.[0] || s.data.results?.[0] || s.data[0]
  if(first){
   title=first.title || first.name
   artist=first.artist || first.artists
   thumb=first.thumbnail || first.image
   let link=first.url || first.link
   if(link){
    let d=await axios.get(`https://api.davidcyriltech.my.id/download/spotify?url=${link}`)
    let res=d.data.result || d.data
    dlUrl=res.downloadUrl || res.url
    duration=res.duration || first.duration || "ᴜɴᴋɴᴏᴡɴ"
   }
  }
 }catch{}
}

if(!dlUrl){
 return m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}

let realSize=await getFileSize(dlUrl)

let cap=`╔══『 🟢 sᴘᴏᴛɪғʏ ᴍᴅ ᴍᴜsɪᴄ🟢』══❒*
║ ★╭═══════════════●○◇
║ ★┃ ᴛɪᴛʟᴇ : ${title}
║ ★┃ ᴀʀᴛɪsᴛ : ${artist}
║ ★┃ ᴅᴜʀᴀᴛɪᴏɴ : ${duration}
║ ★┃ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
║ ★┃ sɪᴢᴇ : ${realSize}
║ ★┃ sᴏᴜʀᴄᴇ : sᴘᴏᴛɪғʏ
║ ★┃ ᴛʏᴘᴇ : ᴀᴜᴅɪᴏ
║ ★╰══════════════════════●○◇
╚═════════════════════════❒*
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

if(thumb){
 await sock.sendMessage(m.chat,{image:{url:thumb},caption:cap},{quoted:m})
}else{
 await sock.sendMessage(m.chat,{text:cap},{quoted:m})
}

await sock.sendMessage(m.chat,{
audio:{url:dlUrl},
mimetype:"audio/mpeg",
fileName: title+".mp3"
},{quoted:m})

}catch(e){
 console.log(e)
 m.reply("ᴀʟʟ sᴇʀᴠᴇʀs ᴀʀᴇ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ")
}
}
}
