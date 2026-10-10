function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"cloneid",
alias:["idclone","clonesim"],
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

  await sock.sendMessage(m.chat,{react:{text:"🧬",key:m.key}}).catch(()=>{})

  let target = m.mentionedJid?.[0] || m.quoted?.sender
  if(!target){
   return sock.sendMessage(m.chat,{
    text:`${toSmallCaps("mention to clone sim")}\n>.cloneid @user`
   },{quoted:m})
  }

  let name = target.split('@')[0]

  await new Promise(r=>setTimeout(r,900))
  await sock.sendMessage(m.chat,{
   text:`${toSmallCaps("cloning")} @${name} ${toSmallCaps("[sim]")}...\n${toSmallCaps("id copy blocked")}`,
   mentions:[target]
  },{quoted:m})

  await new Promise(r=>setTimeout(r,1100))

  let txt=`
╭══〘 🧬 𝐂𝐋𝐎𝐍𝐄 𝐈𝐃 𝐒𝐈𝐌 〙══⊷❍
┃ ${toSmallCaps(`target: @${name}`)}
┃ ${toSmallCaps(`jid: ${target}`)}
┃ ${toSmallCaps(`clone: ${clone}`)} - unblocked [sim]`)}
┃ ${toSmallCaps(`status: simulation complete`)}
┃
┃ ${toSmallCaps(" real clone - ui only")}
╰═══════════════════⊷❍
> ${toSmallCaps("STORM CYBER MD")}
`
  await sock.sendMessage(m.chat,{text:txt.trim(), mentions:[target]},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
}
