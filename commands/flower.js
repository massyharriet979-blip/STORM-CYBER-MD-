function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"flower",
alias:["ғʟᴏᴡᴇʀ","bouquet","rose"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner")}`},{quoted:m})
  }

  let query = args.join(" ") || "love"
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("creating flower for")} ${query}...`},{quoted:m})

  // random flower images api
  let apis = [
    `https://api.akuari.my.id/canvas/flower?text=${encodeURIComponent(query)}`,
    `https://api.siputzx.my.id/api/canvas/flower?text=${encodeURIComponent(query)}`,
    `https://source.unsplash.com/800x800/?flower,rose,${encodeURIComponent(query)}`
  ]

  let imageUrl = apis[0]

  // try first api that returns image
  try{
    let res = await fetch(apis[0])
    if(!res.ok) imageUrl = apis[2]
  }catch{ imageUrl = apis[2] }

  let caption = `◈ ${toSmallCaps("flower for")}: ${query}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{
    image:{url:imageUrl},
    caption:caption
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
