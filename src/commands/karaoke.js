import yts from 'yt-search'
import ytdl from '@distube/ytdl-core'

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"karaoke",
alias:["ʙᴀᴄᴋᴛʀᴀᴄᴋ","ʟʏʀɪᴄsᴍᴜsɪᴄ","ᴋᴀʀᴀᴏᴋᴇ","instrumental"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner")}`},{quoted:m})
  }

  let query = args.join(" ")
  if(!query) return sock.sendMessage(m.chat,{text:`${toSmallCaps("usage:.karaoke faded alan walker")}`},{quoted:m})

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("searching karaoke for")} ${query}...`},{quoted:m})

  let search = await yts(`${query} karaoke instrumental`)
  let video = search.videos[0]
  if(!video) return sock.sendMessage(m.chat,{text:`${toSmallCaps("karaoke not found")}`},{quoted:m})

  let info = await ytdl.getInfo(video.url)
  let format = ytdl.chooseFormat(info.formats,{filter:'audioonly', quality:'highestaudio'})

  await sock.sendMessage(m.chat,{
    audio:{url:format.url},
    mimetype:'audio/mpeg',
    fileName:`${video.title}.mp3`
  },{quoted:m})

  await sock.sendMessage(m.chat,{
    text:`◈ ${video.title}\n${toSmallCaps("duration:")} ${video.timestamp}\n> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
