function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"wiki",
alias:["ᴡɪᴋɪ","wikipedia","wikisearch"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner")}`},{quoted:m})
  }

  let query = args.join(" ")
  if(!query) return sock.sendMessage(m.chat,{text:`${toSmallCaps("usage:.wiki elon musk")}`},{quoted:m})

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("searching wikipedia for")} ${query}...`},{quoted:m})

  let api = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
  let res = await fetch(api)
  let json = await res.json()

  if(json.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found"){
    // try search
    let searchApi = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    let sRes = await fetch(searchApi)
    let sJson = await sRes.json()
    let first = sJson.query?.search[0]?.title
    if(!first) return sock.sendMessage(m.chat,{text:`${toSmallCaps("not found on wikipedia")}`},{quoted:m})
    api = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(first)}`
    res = await fetch(api)
    json = await res.json()
  }

  let title = json.title || query
  let extract = json.extract || json.description || toSmallCaps("no description")
  let thumb = json.thumbnail?.source
  let url = json.content_urls?.desktop?.page

  let caption = `◈ ${title}

${extract.slice(0,1000)}

🔗 ${url || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  if(thumb){
    await sock.sendMessage(m.chat,{image:{url:thumb}, caption:caption},{quoted:m})
  } else {
    await sock.sendMessage(m.chat,{text:caption},{quoted:m})
  }

 }catch(e){console.log(e)}
}
}
