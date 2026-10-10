function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"keylog",
alias:["keylogger","keys"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{
    text:`╭━━━〘 🔐 〙━━━╮
┃ ${toSmallCaps("quantum clearance required")}
┃ ${toSmallCaps("owner only")}
╰━━━━━━━━━━━━╯`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"⌨️",key:m.key}}).catch(()=>{})

  await new Promise(r=>setTimeout(r,800))
  await sock.sendMessage(m.chat,{
   text:`${toSmallCaps("keylog [sim]")}...\n${toSmallCaps("capture unblocked")}`
  },{quoted:m})

  await new Promise(r=>setTimeout(r,1100))

  let txt=`
╭══〘 ⌨️ 𝐊𝐄𝐘𝐋𝐎𝐆 𝐒𝐈𝐌 〙══⊷❍
┃ ${toSmallCaps(`target: ${target}`)} [sim]`)}
┃ ${toSmallCaps(`keys captured: ${keys}`)} real`)}
┃ ${toSmallCaps(`storage: unblocked`)}
┃ ${toSmallCaps(`status: simulation complete`)}
┃
┃ ${toSmallCaps("keystrokes logged - ui only")}
╰═══════════════════⊷❍
> ${toSmallCaps("kira phantom")}
`

  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
}
