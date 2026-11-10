function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"fact",
alias:["ғᴀᴄᴛ","facts","factz"],
execute: async(sock, m, args)=>{
 try{
  // QUANTUM CLEARANCE REQUIRED, OWNER ONLY
  if(!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{
      text:`◈ ${toSmallCaps("quantum clearance required")}\n${toSmallCaps("owner only command")}`
    },{quoted:m})
  }

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("fetching fact...")}`},{quoted:m})

  let fact = ""
  try{
    let res = await fetch(`https://api.akuari.my.id/other/fact`)
    let json = await res.json()
    fact = json.result
  }catch{}

  if(!fact){
    try{
      let res2 = await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/random`)
      let json2 = await res2.json()
      fact = json2.text
    }catch{}
  }

  if(!fact) fact = "Honey never spoils. Archaeologists found 3000 year old honey still edible."

  let imageUrl = "https://files.catbox.moe/jtb63o.jpg"

  let caption = `◈ ғᴀᴄᴛ [ǫᴜᴀɴᴛᴜᴍ]

${fact}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{
    image:{url:imageUrl},
    caption:caption
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
