function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"couple",
alias:["ᴄᴏᴜᴘʟᴇ","ship","lovetest","couplepp"],
execute: async(sock, m, args)=>{
 try{
  // QUANTUM CLEARANCE REQUIRED, OWNER ONLY
  if(!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{
      text:`◈ ${toSmallCaps("quantum clearance required")}\n${toSmallCaps("owner only command")}`
    },{quoted:m})
  }

  let groupMetadata = m.isGroup? await sock.groupMetadata(m.chat) : null
  let participants = groupMetadata?.participants || []

  if(participants.length < 2){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("need at least 2 members in group")}`},{quoted:m})
  }

  // pick 2 random members
  let shuffled = participants.sort(()=>0.5-Math.random())
  let a = shuffled[0]
  let b = shuffled[1]

  let aName = a.id.split("@")[0]
  let bName = b.id.split("@")[0]

  // try get pp
  let ppA, ppB
  try{ ppA = await sock.profilePictureUrl(a.id, 'image') }catch{ ppA = "https://files.catbox.moe/jtb63o.jpg" }
  try{ ppB = await sock.profilePictureUrl(b.id, 'image') }catch{ ppB = "https://files.catbox.moe/jtb63o.jpg" }

  let percent = Math.floor(Math.random()*101)
  let desc = percent > 80? "Perfect Match! 💖" : percent > 60? "Good Couple! 💕" : percent > 40? "Maybe... 😅" : "Not Compatible 💔"

  let imageUrl = "https://files.catbox.moe/jtb63o.jpg"

  let caption = `◈ ᴄᴏᴜᴘʟᴇ [ǫᴜᴀɴᴛᴜᴍ]

@${aName} ❤️ @${bName}

${toSmallCaps("compatibility")}: ${percent}%
${desc}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{
    image:{url:imageUrl},
    caption:caption,
    mentions:[a.id, b.id]
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
