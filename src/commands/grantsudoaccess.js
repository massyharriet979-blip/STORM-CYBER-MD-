function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"grantsudoaccess",
alias:["addsudo","sudoadd","grantsudo"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{
    text:`╭━━━〘 🔐 〙━━━╮
┃ ${toSmallCaps("main owner only")}
┃ ${toSmallCaps("access denied")}
╰━━━━━━━━━━━━╯`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"🔑",key:m.key}}).catch(()=>{})

  let target = m.mentionedJid?.[0] || m.quoted?.sender
  if(!target && args[0]){
   let num = args[0].replace(/[^0-9]/g,'')
   if(num) target = num+"@s.whatsapp.net"
  }
  if(!target){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("mention or reply to grant sudo")}\n>.grantsudoaccess @user`},{quoted:m})
  }

  // ADD TO DB - adjust to your sudo system
  // example for many bots:
  global.db = global.db || {}
  global.db.sudo = global.db.sudo || []
  if(!global.db.sudo.includes(target)){
   global.db.sudo.push(target)
  }

  // if you have env based, also try:
  // import fs to write? keeping simple with db

  let name = target.split('@')[0]

  let txt = `
╭══〘 🔑 𝐒𝐔𝐃𝐎 𝐆𝐑𝐀𝐍𝐓𝐄𝐃 〙══⊷❍
┃ ${toSmallCaps(`user: @${name}`)}
┃ ${toSmallCaps(`level: sub bot owner`)}
┃ ${toSmallCaps(`access: granted`)}
┃ ${toSmallCaps(`permissions: all owner commands`)}
┃ ${toSmallCaps(`status: active`)}
╰═══════════════════⊷❍
> ${toSmallCaps("quantum access updated")}
`

  await sock.sendMessage(m.chat,{text:txt.trim(), mentions:[target]},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}}).catch(()=>{})

  // notify target
  await sock.sendMessage(target,{
   text:`${toSmallCaps("you have been granted sudo access")}\n${toSmallCaps("by main owner")}\n> ${toSmallCaps("kira bot")}`
  }).catch(()=>{})

 }catch(e){ console.log(e) }
}
}
