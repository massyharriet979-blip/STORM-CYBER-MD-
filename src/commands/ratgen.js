function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"ratgen",
alias:["ratsim"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return
  }
  await sock.sendMessage(m.chat,{react:{text:"🐀",key:m.key}}).catch(()=>{})
  await new Promise(r=>setTimeout(r,900))
  let txt=`
╭══〘 🐀 𝐑𝐀𝐓 𝐒𝐈𝐌 〙══⊷❍
┃ ${toSmallCaps("payload: ${payload}`)} - blocked")}
┃ ${toSmallCaps("server: ${server} sim]")}
┃ ${toSmallCaps("status: simulation only")}
┃
┃ ${toSmallCaps("malware - ui only")}
╰═══════════════════⊷❍
`
  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
 }catch(e){console.log(e)}
}
}
