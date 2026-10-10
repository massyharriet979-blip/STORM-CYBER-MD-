function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"phishcheck",
alias:["antiphish","scamcheck"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return
  }
  let url = args[0]
  if(!url) return sock.sendMessage(m.chat,{text:`${toSmallCaps("send suspicious link")}\n>.phishcheck https://example.com`},{quoted:m})

  await sock.sendMessage(m.chat,{react:{text:"🛡️",key:m.key}}).catch(()=>{})

  let score = url.includes('@')||url.length>75||!url.startsWith('https')? "HIGH RISK" : "CHECK"

  let txt=`
╭══〘 🛡️ 𝐏𝐇𝐈𝐒𝐇 𝐂𝐇𝐄𝐂𝐊 〙══⊷❍
┃ ${toSmallCaps(`url: ${url}`)}
┃ ${toSmallCaps(`risk: ${score}`)}
┃ ${toSmallCaps(`https: ${url.startsWith('https')? 'yes':'no - sus')}`)}
┃ ${toSmallCaps(`tips: check domain, no @, no misspell`)}
┃
┃ ${toSmallCaps("stay safe - kira shield")}
╰═══════════════════⊷❍
`
  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
 }catch(e){console.log(e)}
}
}
