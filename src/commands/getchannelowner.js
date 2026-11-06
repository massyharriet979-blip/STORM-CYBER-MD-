function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"getchannelowner",
alias:["channelowner","gcowner","chowner","getchowner"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner) return sock.sendMessage(m.chat,{text:`${toSmallCaps("owner only - restricted")}`},{quoted:m})

  let jid = args[0]
  if(!jid){
   // try quoted newsletter
   if(m.quoted?.chat?.endsWith("@newsletter")) jid = m.quoted.chat
   else jid = m.chat.endsWith("@newsletter")? m.chat : "120363414065055650@newsletter"
  }

  if(!jid.endsWith("@newsletter")) return sock.sendMessage(m.chat,{text:`${toSmallCaps("invalid channel jid")}\n${toSmallCaps("ex:.getchannelowner 1203...@newsletter")}`},{quoted:m})

  await sock.sendMessage(m.chat,{react:{text:"🔍",key:m.key}}).catch(()=>{})

  let meta = await sock.newsletterMetadata("jid", jid).catch(async()=>{
   // fallback
   return await sock.newsletterMetadata("invite", jid).catch(()=>null)
  })

  if(!meta){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("failed to fetch channel - private or invalid")}`},{quoted:m})
  }

  let owner = meta.owner || meta.creation_time? meta.owner : "hidden"
  let name = meta.name || "unknown"
  let followers = meta.subscribers || meta.followers || 0

  let txt = `${toSmallCaps("channel:")} ${name}
${toSmallCaps("jid:")} ${jid}
${toSmallCaps("followers:")} ${followers}
${toSmallCaps("owner jid:")} ${meta.owner || toSmallCaps("hidden by whatsapp - only meta can see")}
${toSmallCaps("creation:")} ${meta.creation_time? new Date(meta.creation_time*1000).toDateString() : "unknown"}

> powered by storm x
> ${toSmallCaps("note: whatsapp hides owner for privacy, only invite creator jid visible via linked group")}`

  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})

 }catch(e){console.log(e); await sock.sendMessage(m.chat,{text:`${toSmallCaps("error fetching owner - whatsapp restricted")}`},{quoted:m})}
}
}
