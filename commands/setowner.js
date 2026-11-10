function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"setowner",
alias:["setownername"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner && !m.isSubBotOwner){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 🔐 〙══⊷❍
┃ ${toSmallCaps("quantum clearance required, owner only")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  let owner = args.join(" ")
  if(!owner){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 👑 𝐒𝐄𝐓𝐎𝐖𝐍𝐄𝐑 〙══⊷❍
┃ ${toSmallCaps("usage")}: .setowner Storm
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  if(!global.botSettings) global.botSettings = {}
  global.botSettings.ownerName = owner

  await sock.sendMessage(m.chat,{
   text:`╭══〘 👑 𝐒𝐄𝐓𝐎𝐖𝐍𝐄𝐑 〙══⊷❍
┃ ${toSmallCaps("owner name updated to")}: ${owner}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e)}
}
};
