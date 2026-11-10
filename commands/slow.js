function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"slow",
alias:["slowmode","slowspeed","lag"],
execute: async(sock, m, args)=>{
 try{
  // SUBBOT OWNER = LINKED DEVICE OWNER
  if(!m.isOwner &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required")}`},{quoted:m})
  }

  let txt=`╭━─━─❰ 🐢 𝐒𝐋𝐎𝐖 𝐌𝐎𝐃𝐄 ❱─━─━╮
┃ ${toSmallCaps("mode: slow quantum")}
┃ ${toSmallCaps("status: cooling down ❄️")}
┃ ${toSmallCaps("engine: power save")}
┃ ${toSmallCaps("speed: 0.5x")}
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("powered by storm x - use.fast to restore")}`

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
