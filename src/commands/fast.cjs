function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"fast",
alias:["speed","turbo","fastmode"],
execute: async(sock, m, args)=>{
 try{
  // SUBBOT OWNER = LINKED DEVICE OWNER (owner of his instance)
  if(!m.isOwner &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required")}`},{quoted:m})
  }

  let start = Date.now()
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("activating fast mode... ⚡")}`},{quoted:m})
  let ping = Date.now() - start

  let txt=`╭━─━─❰ ⚡ 𝐅𝐀𝐒𝐓 𝐌𝐎𝐃𝐄 ❱─━─━╮
┃ ${toSmallCaps(`speed: ${ping}ms`)}
┃ ${toSmallCaps(`mode: turbo quantum ⚡`)}
┃ ${toSmallCaps(`status: active ✅`)}
┃ ${toSmallCaps(`engine: storm v4.0`)}
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("powered by storm x")}`

  await sock.sendMessage(m.chat,{
   text:txt,
   contextInfo:{
    forwardedNewsletterMessageInfo:{
     newsletterJid:"120363414065055650@newsletter",
     newsletterName:"STORM CYBER MD",
     serverMessageId:1
    }
   }
  },{quoted:m})

 }catch(e){ console.log(e) }
}
}
