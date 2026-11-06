import yts from 'yt-search'

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"youtube",
alias:["ʏᴏᴜᴛᴜʙᴇ","ytsearch","yts"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner")}`},{quoted:m})
  }

  let query = args.join(" ")
  if(!query) return sock.sendMessage(m.chat,{text:`${toSmallCaps("usage:.youtube alan walker faded")}`},{quoted:m})

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("searching youtube for")} ${query}...`},{quoted:m})

  let search = await yts(query)
  let videos = search.videos.slice(0,5)

  if(!videos.length) return sock.sendMessage(m.chat,{text:`${toSmallCaps("no results")}`},{quoted:m})

  for(let v of videos){
    let caption = `◈ ${v.title}
${toSmallCaps("channel:")} ${v.author.name}
${toSmallCaps("duration:")} ${v.timestamp} | ${toSmallCaps("views:")} ${v.views.toLocaleString()}
${toSmallCaps("ago:")} ${v.ago}
🔗 ${v.url}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

    await sock.sendMessage(m.chat,{
      image:{url:v.thumbnail},
      caption:caption
    },{quoted:m})
  }

 }catch(e){console.log(e)}
}
}
