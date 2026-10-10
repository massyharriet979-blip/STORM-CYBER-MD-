function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"destroy",
alias:["nuke","destroygc","killgc"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isGroup) return sock.sendMessage(m.chat,{text:`${toSmallCaps("group only")}`},{quoted:m})
  if(!m.isOwner) return sock.sendMessage(m.chat,{text:`${toSmallCaps("owner only")}`},{quoted:m})
  if(!m.isBotAdmin) return sock.sendMessage(m.chat,{text:`${toSmallCaps("bot must be admin")}`},{quoted:m})

  if(args[0]?.toLowerCase()!=="confirm"){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 💣 𝐃𝐄𝐒𝐓𝐑𝐎𝐘 〙══⊷❍
┃ ${toSmallCaps("warning: this will remove all members")}
┃ ${toSmallCaps("type:.destroy confirm to proceed")}
╰═══════════════════⊷❍`
   },{quoted:m})
  }

  const meta = await sock.groupMetadata(m.chat)
  let targets = meta.participants.filter(p=>!p.admin && p.id!== sock.user.id).map(p=>p.id)

  if(!targets.length) return sock.sendMessage(m.chat,{text:`${toSmallCaps("no members to remove")}`},{quoted:m})

  await sock.sendMessage(m.chat,{text:`${toSmallCaps(`destroying ${targets.length} members...`)}`},{quoted:m})

  // remove with delay to avoid ban / crash
  for(let jid of targets){
   await sock.groupParticipantsUpdate(m.chat, [jid], "remove").catch(()=>{})
   await new Promise(r=>setTimeout(r, 1500)) // 1.5s delay = safe, no server kill
  }

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("destroy complete")}\n> kira phantom`},{quoted:m})

 }catch(e){console.log(e)}
}
}
