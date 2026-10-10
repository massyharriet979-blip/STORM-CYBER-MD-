function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"dark",
alias:["darkmode","black","darktheme"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required")}`},{quoted:m})
  }

  let txt=`╭━─━─❰ 🌑 𝐃𝐀𝐑𝐊 𝐌𝐎𝐃𝐄 ❱─━─━╮
┃ ${toSmallCaps("theme: dark quantum")}
┃ ${toSmallCaps("status: enabled 🖤")}
┃ ${toSmallCaps("bg: #000000")}
┃ ${toSmallCaps("eyes: protected 👁️")}
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("powered by storm x")}`

  await sock.sendMessage(m.chat,{
   image:{url:"https://files.catbox.moe/pznw3z.jpg"},
   caption:txt,
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
