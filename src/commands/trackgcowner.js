function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"trackgcowner",
alias:["gcowner","groupcreator","findowner","trueadmin"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isGroup) return sock.sendMessage(m.chat,{text:toSmallCaps("this command is for groups only")},{quoted:m})

  // OWNER ONLY + SUBBOT ONLY
  if(!m.isOwner &&!m.isSubBot){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required, owner only")}\n\n> ${toSmallCaps("powered by storm x")}`},{quoted:m})
  }

  let chk = await sock.sendMessage(m.chat,{text:toSmallCaps("tracking real group creator... quantum scan active...")},{quoted:m})

  let meta=await sock.groupMetadata(m.chat)
  let ownerId=meta.owner || meta.participants.find(p=>p.admin==='superadmin')?.id || meta.participants[0]?.id

  // fallback: if no superadmin, try creation info
  let creationTime=meta.creation? new Date(meta.creation*1000).toLocaleString() : "unknown"

  if(!ownerId){
   return sock.sendMessage(m.chat,{text:toSmallCaps("failed to detect group creator, group may be too old"), edit:chk.key},{quoted:m})
  }

  let ownerNum=ownerId.split('@')[0]
  let isInGroup=meta.participants.some(p=>p.id===ownerId)

  let fakeAdmins=meta.participants.filter(p=>p.admin && p.id!==ownerId).map(p=>`@${p.id.split('@')[0]}`).join(", ") || toSmallCaps("none, only true owner")

  let text=`${toSmallCaps("storm cyber md - gc owner tracker")}\n\n`+
  `${toSmallCaps(`group: ${meta.subject}`)}\n`+
  `${toSmallCaps(`real creator: @${ownerNum}`)}\n`+
  `${toSmallCaps(`owner status: ${isInGroup? "still in group ✅" : "left group ❌"}`)}\n`+
  `${toSmallCaps(`created on: ${creationTime}`)}\n`+
  `${toSmallCaps(`group id: ${m.chat}`)}\n`+
  `${toSmallCaps(`total admins: ${meta.participants.filter(p=>p.admin).length}`)}\n\n`+
  `${toSmallCaps(`fake admins (added later):`)}\n${fakeAdmins}\n\n`+
  `> ${toSmallCaps("quantum clearance verified - owner only")}`

  await sock.sendMessage(m.chat,{text:text, mentions:[ownerId,...meta.participants.filter(p=>p.admin && p.id!==ownerId).map(p=>p.id)], edit:chk.key},{quoted:m})

 }catch(e){ console.log(e) }
}
}
