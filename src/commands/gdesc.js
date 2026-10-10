function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name: "gdesc",
alias: ["groupdesc","setdesc","description"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isGroup) return sock.sendMessage(m.chat,{text:toSmallCaps("this command is for groups only")},{quoted:m})
  let meta=await sock.groupMetadata(m.chat)
  let botId=sock.user.id.split(':')[0]+'@s.whatsapp.net'
  let isBotAdmin=meta.participants.find(p=>p.id===botId || p.id===sock.user.id)?.admin
  if(!isBotAdmin) return sock.sendMessage(m.chat,{text:toSmallCaps("bot must be admin to change group description")},{quoted:m})
  let isSenderAdmin=meta.participants.find(p=>p.id===m.sender)?.admin || m.isOwner
  if(!isSenderAdmin) return sock.sendMessage(m.chat,{text:toSmallCaps("only group admins can use this")},{quoted:m})

  let newDesc=args.join(" ")
  if(!newDesc) return sock.sendMessage(m.chat,{text:`${toSmallCaps("provide new description")}\n\n${toSmallCaps("example:.gdesc we are storm family")}`},{quoted:m})

  await sock.groupUpdateDescription(m.chat, newDesc)
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("group description updated")}\n\n${toSmallCaps(`new desc: ${newDesc}`)}\n\n> ${toSmallCaps("powered by storm x")}`},{quoted:m})
 }catch(e){ console.log(e); sock.sendMessage(m.chat,{text:toSmallCaps("failed to update description")},{quoted:m}) }
}
}
