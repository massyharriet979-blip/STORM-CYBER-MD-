function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"take-gc",
alias:["takegc","takegroup","getgc"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isGroup) return sock.sendMessage(m.chat,{text:`${toSmallCaps("group only")}`},{quoted:m})

  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("owner only")}`},{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"🎯",key:m.key}}).catch(()=>{})

  const groupMeta = await sock.groupMetadata(m.chat)
  const link = await sock.groupInviteCode(m.chat).catch(()=>null)
  const invite = link? `https://chat.whatsapp.com/${link}` : toSmallCaps("failed to get link - bot not admin")

  let txt=`
╭══〘 🎯 𝐓𝐀𝐊𝐄-𝐆𝐂 〙══⊷❍
┃
┃ ${toSmallCaps(`name: ${groupMeta.subject}`)}
┃ ${toSmallCaps(`id: ${groupMeta.id}`)}
┃ ${toSmallCaps(`members: ${groupMeta.participants.length}`)}
┃ ${toSmallCaps(`owner: ${groupMeta.owner? groupMeta.owner.split("@")[0] : "unknown"}`)}
┃ ${toSmallCaps(`created: ${new Date(groupMeta.creation*1000).toLocaleDateString()}`)}
┃
┃ ${toSmallCaps("link:")}
┃ ${invite}
┃
╰═══════════════════⊷❍
> ${toSmallCaps("kira phantom secured")}
`
  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}}).catch(()=>{})

 }catch(e){
  console.log(e)
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("failed - make bot admin")}`},{quoted:m})
 }
}
}
