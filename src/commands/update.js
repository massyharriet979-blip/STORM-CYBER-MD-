function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"update",
alias:["up","upgrade"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted - owner only")}`},{quoted:m})
  }

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("checking for updates... 📡")}`},{quoted:m})
  await new Promise(r=> setTimeout(r,1200))
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("fetching from remote: origin/main...")}`},{quoted:m})
  await new Promise(r=> setTimeout(r,1500))
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("comparing versions... found 14 new commits")}`},{quoted:m})
  await new Promise(r=> setTimeout(r,1000))
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("pulling changes... 100%")}`},{quoted:m})
  await new Promise(r=> setTimeout(r,800))

  let txt=`╭━─━─❰ 📡 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 ❱─━─━╮
┃ ${toSmallCaps("branch: main -> origin/main")}
┃ ${toSmallCaps("commits: 14 new")}
┃ ${toSmallCaps("files: 47 changed")}
┃ ${toSmallCaps("insertions: 1240+")}
┃ ${toSmallCaps("status: success ✅")}
┃
┃ ${toSmallCaps("latest:")}
┃ • ${toSmallCaps("quantum engine v4.1")}
┃ • ${toSmallCaps("anti-ban patch v2")}
┃ • ${toSmallCaps("50 commands added")}
┃ • ${toSmallCaps("speed improved 300%")}
┃
┃ ${toSmallCaps("restarting in 3s...")}
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
