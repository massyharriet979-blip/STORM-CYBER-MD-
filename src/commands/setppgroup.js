function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"setppgroup",
alias:["setgpp","setgrouppp"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isGroup) return sock.sendMessage(m.chat,{text:`${toSmallCaps("group only")}`},{quoted:m})

  const isBotAdmin = m.isBotAdmin
  if(!isBotAdmin) return sock.sendMessage(m.chat,{text:`${toSmallCaps("bot must be admin")}`},{quoted:m})

  const isAdmin = m.isAdmin || m.isOwner
  if(!isAdmin) return sock.sendMessage(m.chat,{text:`${toSmallCaps("admin only")}`},{quoted:m})

  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || q.type || ""

  if(!/image/.test(mime)){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 🖼️ 𝐒𝐄𝐓𝐏𝐏 〙══⊷❍
┃ ${toSmallCaps("reply to an image")}
┃ ${toSmallCaps("usage: reply image +.setppgroup")}
╰═══════════════════⊷❍`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"🖼️",key:m.key}}).catch(()=>{})

  let media = await q.download()

  await sock.updateProfilePicture(m.chat, media)

  let txt=`
╭══〘 🖼️ 𝐆𝐑𝐎𝐔𝐏 𝐏𝐏 〙══⊷❍
┃ ${toSmallCaps("profile picture updated")}
┃ ${toSmallCaps("by:")} @${m.sender.split("@")[0]}
╰═══════════════════⊷❍
> ${toSmallCaps("kira phantom")}
`
  await sock.sendMessage(m.chat,{text:txt.trim(), mentions:[m.sender]},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}}).catch(()=>{})

 }catch(e){
  console.log(e)
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("failed to update pp")}`},{quoted:m})
 }
}
}
