function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"deathwrite",
alias:["dw","writedeath","notewrite"],
execute: async(sock, m, args)=>{
 try{
  // OWNER ONLY - subbot check as in index.js
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
   let num = args[0].replace(/[^0-9]/g,'')
   if(num) target = num+"@s.whatsapp.net"
  }
  if(!target){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("mention user or reply")}\n>.deathwrite @user heart attack`},{quoted:m})
  }

  let cause = args.slice(1).join(" ") || "heart attack"
  let name = target.split('@')[0]

  await sock.sendMessage(m.chat,{react:{text:"✍️",key:m.key}}).catch(()=>{})
  await new Promise(r=> setTimeout(r,800))

  let text = `
╭══〘 📓 𝐃𝐄𝐀𝐓𝐇 𝐖𝐑𝐈𝐓𝐄 〙══⊷❍
┃ ${toSmallCaps(`name: @${name}`)}
┃ ${toSmallCaps(`written by: kira`)}
┃ ${toSmallCaps(`cause: ${cause}`)}
┃ ${toSmallCaps(`time left: 40s`)}
┃
┃ ${toSmallCaps("the human whose name is")}
┃ ${toSmallCaps("written in this note shall die")}
┃
┃ ${toSmallCaps("status: written ☠️")}
╰═══════════════════⊷❍
> ${toSmallCaps("judgement complete")}
`

  await sock.sendMessage(m.chat,{
   text:text.trim(),
   mentions:[target]
  },{quoted:m})

  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})

 }catch(e){ console.log(e) }
}
}
