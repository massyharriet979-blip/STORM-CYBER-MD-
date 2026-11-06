function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"reboot",
alias:["rebot2","restart2"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner && !m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{
    text:`╭━━━〘 🔐 〙━━━╮
┃ ${toSmallCaps("quantum clearance required")}
┃ ${toSmallCaps("owner only")}
╰━━━━━━━━━━━━╯`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"🔄",key:m.key}}).catch(()=>{})

  await sock.sendMessage(m.chat,{
   text:`${toSmallCaps("rebooting")}...`
  },{quoted:m})

  await new Promise(r=>setTimeout(r,1000))
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("shutting down services")}... 30%`},{quoted:m})
  await new Promise(r=>setTimeout(r,800))
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("clearing cache")}... 65%`},{quoted:m})
  await new Promise(r=>setTimeout(r,800))
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("restarting kernel")}... 90%`},{quoted:m})
  await new Promise(r=>setTimeout(r,900))

  let txt = `
╭══〘 🔄 𝐑𝐄𝐁𝐎𝐎𝐓 𝐒𝐈𝐌 〙══⊷❍
┃ ${toSmallCaps("status: reboot complete [sim]")}
┃ ${toSmallCaps("uptime reset: 16min")}
┃ ${toSmallCaps("services: online")}
┃
┃ ${toSmallCaps(" reboot - ui only")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}
`
  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
};
