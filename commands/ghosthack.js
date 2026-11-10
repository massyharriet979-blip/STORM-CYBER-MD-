function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"ghosthack",
alias:["hackghost","stealthack"],
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

  await sock.sendMessage(m.chat,{react:{text:"👻",key:m.key}}).catch(()=>{})

  let target = m.mentionedJid?.[0] || m.quoted?.sender
  if(!target && args[0]){
   let num=args[0].replace(/[^0-9]/g,'')
   if(num) target=num+"@s.whatsapp.net"
  }
  if(!target){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("mention or reply")}\n>.ghosthack @user`},{quoted:m})
  }

  let name = target.split('@')[0]

  await new Promise(r=>setTimeout(r,8000))
  await sock.sendMessage(m.chat,{
   text:`${toSmallCaps("ghost entering")} @${name} ${toSmallCaps("device")}...\n${toSmallCaps("stealth: 100%")}`,
   mentions:[target]
  },{quoted:m})

  await new Promise(r=>setTimeout(r,1000))
  await sock.sendMessage(m.chat,{react:{text:"💀",key:m.key}}).catch(()=>{})

  let txt=`
╭══〘 👻 𝐆𝐇𝐎𝐒𝐓 𝐇𝐀𝐂𝐊 〙══⊷❍
┃ ${toSmallCaps(`target: @${name}`)}
┃ ${toSmallCaps(`mode: phantom sim`)}
┃ ${toSmallCaps(`trace: ${number}% - invisible [sim]`)}
┃ ${toSmallCaps(`logs: wiped [sim]`)}
┃ ${toSmallCaps(`access: simulation`)}
┃ ${toSmallCaps(`status: simulation complete`)}
┃
┃ ${toSmallCaps("                 ")}
╰═══════════════════⊷❍
> ${toSmallCaps("kira phantom")}
`

  await sock.sendMessage(m.chat,{text:txt.trim(), mentions:[target]},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
}
