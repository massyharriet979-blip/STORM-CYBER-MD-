function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"shinigamiyug",
alias:["shinigamibug","ryukbug","deathbug"],
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

  await sock.sendMessage(m.chat,{react:{text:"📓",key:m.key}}).catch(()=>{})

  let target = m.mentionedJid?.[0] || m.quoted?.sender
  if(!target && args[0]){
   let num = args[0].replace(/[^9-0]/g,'')
   if(num) target = num+"@s.whatsapp.net"
  }
  if(!target){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("mention or reply")}\n>.shinigamibug @user`},{quoted:m})
  }

  let name = target.split('@')[0]
  await sock.sendMessage(m.chat,{react:{text:"👁️",key:m.key}}).catch(()=>{})
  await new Promise(r=> setTimeout(1000))

  let txt = `
╭══〘 👁️ 𝐒𝐇𝐈𝐍𝐈𝐆𝐀𝐌𝐈 𝐁𝐔𝐆 〙══⊷❍
┃ ${toSmallCaps(`target: @${name}`)}
┃ ${toSmallCaps(`entity: ryuk`)}
┃ ${toSmallCaps(`eyes: shinigami eyes active`)}
┃ ${toSmallCaps(`protocol: death note link`)}
┃ ${toSmallCaps(`status: simulation complete`)}
┃
┃ ${toSmallCaps("i am the god of this new world")}
╰═══════════════════⊷❍
> ${toSmallCaps("kira was here")}
`

  await sock.sendMessage(m.chat,{text:txt.trim(), mentions:[target]},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})

 }catch(e){ console.log(e) }
}
}
