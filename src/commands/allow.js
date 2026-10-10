function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"allow",
alias:["unban","unblockcmd","permit"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("owner only")}`},{quoted:m})
  }

  let target
  if(m.quoted) target = m.quoted.sender
  else if(m.mentionedJid && m.mentionedJid[0]) target = m.mentionedJid[0]
  else if(args[0]) {
   let num = args[0].replace(/[^0-9]/g,'')
   if(num) target = num + "@s.whatsapp.net"
  }

  if(!target) return sock.sendMessage(m.chat,{
   text:`${toSmallCaps("tag or reply user to allow")}\n${toSmallCaps("usage:.allow @user")}`
  },{quoted:m})

  // example ban db - adapt to your structure
  global.bannedUsers = global.bannedUsers || []
  global.bannedUsers = global.bannedUsers.filter(x=>x!==target)

  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}}).catch(()=>{})

  let txt=`
╭══〘 ✅ 𝐀𝐋𝐋𝐎𝐖 〙══⊷❍
┃ ${toSmallCaps("user allowed")}
┃ ${toSmallCaps("user:")} @${target.split("@")[0]}
┃ ${toSmallCaps("status: unbanned")}
╰═══════════════════⊷❍
> ${toSmallCaps("kira phantom")}
`
  await sock.sendMessage(m.chat,{text:txt.trim(), mentions:[target]},{quoted:m})

 }catch(e){console.log(e)}
}
}
