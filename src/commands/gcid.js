function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"gcid",
alias:["gcjid","groupid","idgc","getgcid"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isGroup) return sock.sendMessage(m.chat,{text:`${toSmallCaps("group only")}`},{quoted:m})

  let gcId = m.chat
  let meta = await sock.groupMetadata(m.chat).catch(()=>null)
  let name = meta?.subject || toSmallCaps("unknown")

  let txt=`
╭══〘 🆔 𝐆𝐂-𝐈𝐃 〙══⊷❍
┃ ${toSmallCaps(`name: ${name}`)}
┃
┃ ${toSmallCaps("jid:")}
┃ ${gcId}
┃
┃ ${toSmallCaps("copy jid for channel view")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm x")}
`

  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"🆔",key:m.key}}).catch(()=>{})

 }catch(e){console.log(e)}
}
}
