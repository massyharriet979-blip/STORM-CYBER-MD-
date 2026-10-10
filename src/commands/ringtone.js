import yts from 'yt-search'
import ytdl from '@distube/ytdl-core'

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"ringtone",
alias:["ring","ʀɪɴɢᴛᴏɴᴇ"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner can use ringtone")}`},{quoted:m})
  }

  let query = args.join(" ")
  if(!query) return sock.sendMessage(m.chat,{text:`${toSmallCaps("usage:.ringtone faded alan walker")}`},{quoted:m})

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("searching")} ${query}...`},{quoted:m})

  let search = await yts(`${query} ringtone`)
  let video = search.videos[0]
  if(!video) return sock.sendMessage(m.chat,{text:`${toSmallCaps("not found")}`},{quoted:m})

  // get audio stream url
  let info = await ytdl.getInfo(video.url)
  let format = ytdl.chooseFormat(info.formats, {filter:'audioonly', quality:'highestaudio'})

  await sock.sendMessage(m.chat,{
    audio:{url: format.url},
    mimetype:'audio/mpeg',
    fileName:`${video.title}.mp3`
  },{quoted:m})

  await sock.sendMessage(m.chat,{text:`◈ ${video.title}\n> ${toSmallCaps("by storm cyber md")}`},{quoted:m})

 }catch(e){console.log(e)}
}
}
