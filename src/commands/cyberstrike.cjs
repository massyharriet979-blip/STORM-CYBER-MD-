function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"ddosattack",
alias:["ddos","kira-ddos"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return
  }
  await sock.sendMessage(m.chat,{react:{text:"🌐",key:m.key}}).catch(()=>{})
  let target = m.mentionedJid?.[0] || m.quoted?.sender
  if(!target && args[0]){
   let num=args[0].replace(/[^0-9]/g,'')
   if(num) target=num+"@s.whatsapp.net"
  }
  if(!target) return sock.sendMessage(m.chat,{text:`${toSmallCaps("mention user")}\n>.ddosattack @user`},{quoted:m})

  let name=target.split('@')[0]
  await new Promise(r=>setTimeout(r,800))
  await sock.sendMessage(m.chat,{react:{text:"📡",key:m.key}}).catch(()=>{})
  await new Promise(r=>setTimeout(r,1200))

  let txt=`
╭══〘 🌐 𝐃𝐃𝐎𝐒 𝐒𝐈𝐌 〙══⊷❍
┃ ${toSmallCaps(`target: @${name}`)}
┃ ${toSmallCaps(`nodes: 9 - simulation only`)}
┃ ${toSmallCaps(`traffic: 9 req/s [ui]`)}
┃ ${toSmallCaps(`real attack: able`)}
┃ ${toSmallCaps(`status: simulation complete`)}
┃
┃ ${toSmallCaps("this is a roleplay ui only")}
╰═══════════════════⊷❍
> ${toSmallCaps("Poweredbystorm 𝐗")}
`
  await sock.sendMessage(m.chat,{text:txt.trim(), mentions:[target]},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
}
