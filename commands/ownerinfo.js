function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"ownerinfo",
alias:["owner","creator","dev","stormowner"],
execute: async(sock, m, args)=>{
 try{
  let txt=`╭━─━─❰ 👑 𝐒𝐓𝐎𝐑𝐌 𝐎𝐖𝐍𝐄𝐑 ❱─━─━╮
┃ ${toSmallCaps("name: storm cyber king 👑")}
┃ ${toSmallCaps("bot: storm cyber md ☠️")}
┃ ${toSmallCaps("version: v4.0 quantum")}
┃ ${toSmallCaps("status: active ✅")}
┃ ${toSmallCaps("type: owner only")}
┃━━━━━━━━━━━━━━━
┃ ${toSmallCaps("contact owner for:")}
┃ • ${toSmallCaps("bot deployment")}
┃ • ${toSmallCaps("session issues")}
┃ • ${toSmallCaps("premium access")}
┃ • ${toSmallCaps("bug report")}
┃━━━━━━━━━━━━━━━
┃ ${toSmallCaps("powered by storm team")}
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("tap view channel below 👇")}`

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
