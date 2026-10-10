function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"ppcouple",
alias:["ᴘᴘᴄᴏᴜᴘʟᴇ","couplepic","ppcp"],
execute: async(sock, m, args)=>{
 try{
  // QUANTUM CLEARANCE REQUIRED, OWNER ONLY
  if(!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{
      text:`◈ ${toSmallCaps("quantum clearance required")}\n${toSmallCaps("owner only command")}`
    },{quoted:m})
  }

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("generating couple pp...")}`},{quoted:m})

  let api = `https://api.akuari.my.id/other/couplepp`
  let res = await fetch(api)
  let json = await res.json()

  let male = json.result?.male || json.result?.cowok
  let female = json.result?.female || json.result?.cewek

  if(!male){
    male = "https://files.catbox.moe/jtb63o.jpg"
    female = "https://files.catbox.moe/jtb63o.jpg"
  }

  let cap = `◈ ᴘᴘᴄᴏᴜᴘʟᴇ [ǫᴜᴀɴᴛᴜᴍ]

${toSmallCaps("male & female pp generated")}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{
    image:{url:male},
    caption:`${toSmallCaps("male pp")}`
  },{quoted:m})

  await sock.sendMessage(m.chat,{
    image:{url:female},
    caption:cap
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
