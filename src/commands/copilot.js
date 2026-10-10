function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"copilot",
alias:["ᴄᴏᴘɪʟᴏᴛ","copilotai","mscopilot"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`◈ ${toSmallCaps("quantum clearance required")}\n${toSmallCaps("owner only command")}`},{quoted:m})
  }

  let query = args.join(" ")
  if(!query) return sock.sendMessage(m.chat,{text:`${toSmallCaps("usage:.copilot write code for bot")}`},{quoted:m})

  await sock.sendMessage(m.chat,{text:`◈ ${toSmallCaps("copilot is coding...")}`},{quoted:m})

  let api = `https://api.akuari.my.id/ai/copilot?chat=${encodeURIComponent(query)}`
  let res = await fetch(api)
  let json = await res.json()

  let answer = json.result

  if(!answer){
    let api2 = `https://api.siputzx.my.id/api/ai/copilot?prompt=${encodeURIComponent(query)}`
    let res2 = await fetch(api2)
    let json2 = await res2.json()
    answer = json2.data
  }

  if(!answer){
    let api3 = `https://api.akuari.my.id/ai/bing?chat=${encodeURIComponent(query)}`
    let res3 = await fetch(api3)
    let json3 = await res3.json()
    answer = json3.result
  }

  if(!answer) return sock.sendMessage(m.chat,{text:`${toSmallCaps("copilot failed")}`},{quoted:m})

  let txt = `◈ ᴄᴏᴘɪʟᴏᴛ [${toSmallCaps("quantum")}]

Q: ${query}

A: ${answer.slice(0,3800)}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ x ǫᴜᴀɴᴛᴜᴍ`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})

 }catch(e){console.log(e)}
}
}
