function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"kirajudge",
alias:["judgekira","judgement","kira"],
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
  if(!target){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("mention or reply")}\n>.kirajudge @user`},{quoted:m})
  }

  let name = target.split('@')[0]
  let reason = args.slice(1).join(" ") || "criminal record found"
  let verdicts = ["guilty","innocent","needs observation"]
  let verdict = verdicts[Math.floor(Math.random()*verdicts.length)]

  await sock.sendMessage(m.chat,{react:{text:"📓",key:m.key}}).catch(()=>{})
  await new Promise(r=> setTimeout(r,800))

  let txt = `
╭══〘 ⚖️ 𝐊𝐈𝐑𝐀 𝐉𝐔𝐃𝐆𝐄 〙══⊷❍
┃ ${toSmallCaps(`suspect: @${name}`)}
┃ ${toSmallCaps(`charge: ${reason}`)}
┃ ${toSmallCaps(`verdict: ${verdict}`)}
┃ ${toSmallCaps(`judge: light yagami`)}
┃ ${toSmallCaps(`witness: ryuk`)}
┃ ${toSmallCaps(`status: simulation complete`)}
┃
┃ ${toSmallCaps("justice will be served")}
╰═══════════════════⊷❍
> ${toSmallCaps("in the name of kira")}
`

  await sock.sendMessage(m.chat,{text:txt.trim(), mentions:[target]},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:verdict==="guilty"?"☠️":"✅",key:m.key}}).catch(()=>{})

 }catch(e){ console.log(e) }
}
}
