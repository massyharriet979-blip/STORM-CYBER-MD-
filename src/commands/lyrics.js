import yts from 'yt-search'

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"lyrics",
alias:["lyric","ʟʏʀɪᴄs"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe) return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner")}`},{quoted:m})

  let query = args.join(" ")
  if(!query) return sock.sendMessage(m.chat,{text:`${toSmallCaps("usage:.lyrics faded")}`},{quoted:m})

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("searching lyrics for")} ${query}...`},{quoted:m})

  let api = `https://api.akuari.my.id/search/lirik?query=${encodeURIComponent(query)}`
  let res = await fetch(api)
  let json = await res.json()

  if(!json.result){
   let api2 = `https://lyrics-api-by-akuari.vercel.app/search?query=${encodeURIComponent(query)}`
   res = await fetch(api2)
   json = await res.json()
  }

  let title = json.result?.title || json.result?.judul || query
  let lyrics = json.result?.lyrics || json.result?.lirik || json.result
  let artist = json.result?.artist || ""

  if(!lyrics) return sock.sendMessage(m.chat,{text:`${toSmallCaps("lyrics not found")}`},{quoted:m})

  // get artist image from yt
  let search = await yts(`${query} official`)
  let thumb = search.videos[0]?.thumbnail || search.videos[0]?.image || null

  let caption = `◈ ${title.toUpperCase()}
${toSmallCaps("artist:")} ${artist || query}

${String(lyrics).slice(0,3000)}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  if(thumb){
    await sock.sendMessage(m.chat,{image:{url:thumb}, caption:caption},{quoted:m})
  } else {
    await sock.sendMessage(m.chat,{text:caption},{quoted:m})
  }

 }catch(e){console.log(e)}
}
}
