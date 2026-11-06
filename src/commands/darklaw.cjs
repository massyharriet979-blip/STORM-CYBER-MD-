function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"darklaw",
alias:["lawdark","kirajustice"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{
    text:`╭━━━〘 🔐 〙━━━╮
┃ ${toSmallCaps("quantum clearance required")}
┃ ${toSmallCaps("owner only")}
┃ ${toSmallCaps("access denied")}
╰━━━━━━━━━━━━╯`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"⚖️",key:m.key}}).catch(()=>{})

  let target = m.mentionedJid?.[0] || m.quoted?.sender
  if(!target && args[0]){
   let num = args[0].replace(/[^0-9]/g,'')
   if(num) target = num+"@s.whatsapp.net"
  }

  let crime = args.slice( target? 1 : 0).join(" ") || "breaking the law of kira"
  let laws = [
   "article 1: those who oppose kira shall be judged",
   "article 7: justice is absolute",
   "article 9: the new world has no place for criminals",
   "article 13: kira is law",
  ]
  let law = laws[Math.floor(Math.random()*laws.length)]

  let nameTxt = target? `@${target.split('@')[0]}` : toSmallCaps("all criminals")

  await new Promise(r=> setTimeout(r, 700))
  await sock.sendMessage(m.chat,{react:{text:"📜",key:m.key}}).catch(()=>{})

  let txt = `
╭══〘 ⚖️ 𝐃𝐀𝐑𝐊 𝐋𝐀𝐖 〙══⊷❍
┃ ${toSmallCaps(`accused: ${nameTxt}`)}
┃ ${toSmallCaps(`crime: ${crime}`)}
┃ ${toSmallCaps(`law: ${law}`)}
┃ ${toSmallCaps(`judge: kira`)}
┃ ${toSmallCaps(`court: shinigami realm`)}
┃ ${toSmallCaps(`verdict: guilty by kira law`)}
┃ ${toSmallCaps(`status: simulation complete`)}
╰═══════════════════⊷❍
> ${toSmallCaps("i am justice")}
`

  await sock.sendMessage(m.chat,{
   text:txt.trim(),
   mentions: target? [target] : []
  },{quoted:m})

  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})

 }catch(e){ console.log(e) }
}
}
