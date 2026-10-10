function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"delallow",
alias:["ban","blockuser","disallow","delallowuser"],
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
   text:`${toSmallCaps("tag or reply user to delallow")}\n${toSmallCaps("usage:.delallow @user")}`
  },{quoted:m})

  if(target === m.sender || global.owner?.includes(target)) return sock.sendMessage(m.chat,{text:`${toSmallCaps("can't ban owner")}`},{quoted:m})

  global.bannedUsers = global.bannedUsers || []
  if(!global.bannedUsers.includes(target)) global.bannedUsers.push(target)

  await sock.sendMessage(m.chat,{react:{text:"⛔",key:m.key}}).catch(()=>{})

  let txt=`
╭══〘 ⛔ 𝐃𝐄𝐋𝐀𝐋𝐋𝐎𝐖 〙══⊷❍
┃ ${toSmallCaps("user disallowed")}
┃ ${toSmallCaps("user:")} @${target.split("@")[0]}
┃ ${toSmallCaps("status: banned")}
╰═══════════════════⊷❍
> ${toSmallCaps("kira phantom")}
`
  await sock.sendMessage(m.chat,{text:txt.trim(), mentions:[target]},{quoted:m})

 }catch(e){console.log(e)}
}
}
