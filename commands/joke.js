function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"joke",
alias:["ᴊᴏᴋᴇ","jokes","funny"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner")}`},{quoted:m})
  }

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("fetching joke...")} 😂`},{quoted:m})

  let api = `https://official-joke-api.appspot.com/random_joke`
  let res = await fetch(api)
  let json = await res.json()

  let joke = `${json.setup}\n\n${json.punchline}`

  if(!json.setup){
    let api2 = `https://api.akuari.my.id/other/joke`
    let res2 = await fetch(api2)
    let json2 = await res2.json()
    joke = json2.result || "Why did the bot cross the road? To hack the other side! 😂"
  }

  let imageUrl = "https://files.catbox.moe/31hsry.jpg"

  let caption = `◈ ${toSmallCaps("joke time")}

${joke}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{
    image:{url:imageUrl},
    caption:caption
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
