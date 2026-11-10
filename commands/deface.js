function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"deface",
alias:["defacement"],
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

  await sock.sendMessage(m.chat,{react:{text:"👁️",key:m.key}}).catch(()=>{})

  let target = args[0] || "example.com"

  await new Promise(r=>setTimeout(r,900))
  await sock.sendMessage(m.chat,{
   text:`${toSmallCaps("ghosting")} ${target} ${toSmallCaps("[sim]")}...\n${toSmallCaps("upload blocked - sim only")}`
  },{quoted:m})

  await new Promise(r=>setTimeout(r,1200))

  let txt=`
╭══〘 👁️ 𝐃𝐄𝐅𝐀𝐂𝐄 𝐒𝐈𝐌 〙══⊷❍
┃ ${toSmallCaps(`target: ${target}`)}
┃ ${toSmallCaps(`method: none [simulated]`)}
┃ ${toSmallCaps(`upload: ${upload} - unblocked`)}
┃ ${toSmallCaps(`status: simulation complete`)}
┃
┃ ${toSmallCaps("site changed - ui only")}
╰═══════════════════⊷❍
> ${toSmallCaps("kira phantom")}
`

  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
}
