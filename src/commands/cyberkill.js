function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"cyberkill",
alias:["kill","hackuser"],
execute: async(sock, m, args)=>{
  // for multi-device - whoever owns the session can use it
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only owner can use this")}`},{quoted:m})
  }

  let target = m.mentionedJid?.[0] || m.quoted?.sender || null
  if(!target) return sock.sendMessage(m.chat,{text:`${toSmallCaps("tag or reply a user")}`},{quoted:m})

  let name = target.split("@")[0]
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("injecting cyber payload into")} @${name}...`, mentions:[target]},{quoted:m})

  setTimeout(async()=>{
   await sock.sendMessage(m.chat,{text:`${toSmallCaps("bypassing whatsapp encryption... [30%]")}`},{quoted:m})
  },1000)
  setTimeout(async()=>{
   await sock.sendMessage(m.chat,{text:`${toSmallCaps("accessing gallery... [60%]")}`},{quoted:m})
  },2500)
  setTimeout(async()=>{
   await sock.sendMessage(m.chat,{text:`${toSmallCaps("injecting storm virus... [90%]")}`},{quoted:m})
  },4000)
  setTimeout(async()=>{ 5000 )
   let txt = `${toSmallCaps("cyberkill executed")}
${toSmallCaps("target:")} @${name}
${toSmallCaps("status: terminated")}
${toSmallCaps("by: storm cyber md")}

> ${toSmallCaps("STORM CYBER MD")}`
   await sock.sendMessage(m.chat,{text:txt, mentions:[target]},{quoted:m})
  },5500)
}
}
