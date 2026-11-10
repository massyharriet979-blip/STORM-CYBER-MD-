function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"google",
alias:["ɢᴏɢʟᴇ","gsearch","search"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner")}`},{quoted:m})
  }

  let query = args.join(" ")
  if(!query) return sock.sendMessage(m.chat,{text:`${toSmallCaps("usage:.google storm cyber md")}`},{quoted:m})

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("googling for")} ${query}...`},{quoted:m})

  let api = `https://api.akuari.my.id/search/google?query=${encodeURIComponent(query)}`
  let res = await fetch(api)
  let json = await res.json()

  if(!json.result || json.result.length==0){
    // fallback direct link
    let link = `https://www.google.com/search?q=${encodeURIComponent(query)}`
    return sock.sendMessage(m.chat,{text:`◈ ${toSmallCaps("google search")}: ${query}\n${link}\n> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`},{quoted:m})
  }

  let results = json.result.slice(0,5).map((v,i)=>`*${i+1}. ${v.title}*\n${v.description?.slice(0,150) || ""}\n🔗 ${v.link || v.url}`).join("\n\n")

  let txt = `◈ ${toSmallCaps("google results for")}: ${query}

${results}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})

 }catch(e){
  console.log(e)
  let query = args.join(" ")
  let link = `https://www.google.com/search?q=${encodeURIComponent(query)}`
  await sock.sendMessage(m.chat,{text:`🔍 ${query}\n${link}`},{quoted:m})
 }
}
}
