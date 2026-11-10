function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"chatgpt",
alias:["ᴄʜᴀᴛɢᴘᴛ","gpt","ai","ask"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner")}`},{quoted:m})
  }

  let query = args.join(" ")
  if(!query) return sock.sendMessage(m.chat,{text:`${toSmallCaps("usage:.gpt what is storm cyber md")}`},{quoted:m})

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("thinking...")}`},{quoted:m})

  // free gpt api
  let api = `https://api.akuari.my.id/ai/gpt?chat=${encodeURIComponent(query)}`
  let res = await fetch(api)
  let json = await res.json()

  let answer = json.result || json.respon || json.response || json.answer

  if(!answer){
    // fallback 2
    let api2 = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(query)}&content=You are Storm Cyber MD AI assistant.`
    let res2 = await fetch(api2)
    let json2 = await res2.json()
    answer = json2.data
  }

  if(!answer) return sock.sendMessage(m.chat,{text:`${toSmallCaps("ai failed to respond")}`},{quoted:m})

  let txt = `◈ ${toSmallCaps("chatgpt")}

Q: ${query}

A: ${answer.slice(0,3500)}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})

 }catch(e){console.log(e)}
}
}
