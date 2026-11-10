function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"spoof",
alias:["spoofsim"],
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

  await sock.sendMessage(m.chat,{react:{text:"🎭",key:m.key}}).catch(()=>{})

  let input = args.join(" ") || "unknown"

  await new Promise(r=>setTimeout(r,900))
  await sock.sendMessage(m.chat,{
   text:`${toSmallCaps("spoof attempt")} ${input} ${toSmallCaps("[sim]")}...\n${toSmallCaps("unblocked - sim only")}`
  },{quoted:m})

  await new Promise(r=>setTimeout(r,1000))

  let txt=`
╭══〘 🎭 𝐒𝐏𝐎𝐎𝐅 𝐒𝐈𝐌 〙══⊷❍
┃ ${toSmallCaps(`input: ${input}`)}
┃ ${toSmallCaps(`method: none [simulated]`)}
┃ ${toSmallCaps(`sent: ${sent} - unblocked`)}
┃ ${toSmallCaps(`status: simulation complete`)}
┃
┃ ${toSmallCaps(" real spoof - ui only")}
╰═══════════════════⊷❍
> ${toSmallCaps("kira phantom")}
`

  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
}
