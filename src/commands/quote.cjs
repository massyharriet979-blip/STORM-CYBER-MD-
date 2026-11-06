function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"quote",
alias:["ǫᴜᴏᴛᴇ","quotes"],
execute: async(sock, m, args)=>{
 try{
  // QUANTUM CLEARANCE REQUIRED, OWNER ONLY
  if(!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{
      text:`◈ ${toSmallCaps("quantum clearance required")}\n${toSmallCaps("owner only command")}`
    },{quoted:m})
  }

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("fetching quote...")}`},{quoted:m})

  let quote = "", author = ""
  try{
    let res = await fetch(`https://api.quotable.io/random`)
    let json = await res.json()
    quote = json.content
    author = json.author
  }catch{}

  if(!quote){
    let res2 = await fetch(`https://api.akuari.my.id/other/quote`)
    let json2 = await res2.json()
    quote = json2.result?.quote || json2.result
    author = json2.result?.author || "Unknown"
  }

  if(!quote) quote = "Storm doesn't warn, it arrives."

  let imageUrl = "https://files.catbox.moe/jtb63o.jpg"

  let caption = `◈ ǫᴜᴏᴛᴇ [ǫᴜᴀɴᴛᴜᴍ]

"${quote}"

— ${author || "Unknown"}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{
    image:{url:imageUrl},
    caption:caption
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
