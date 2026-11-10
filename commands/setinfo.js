function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"setinfo",
alias:["setabout","setbio"],
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

  let info = args.join(" ")
  if(!info){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 ℹ️ 𝐒𝐄𝐓𝐈𝐍𝐅𝐎 〙══⊷❍
┃ ${toSmallCaps("usage")}: .setinfo STORM CYBER MD - Best Bot
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  await sock.updateProfileStatus(info).catch(()=>{})
  if(!global.botSettings) global.botSettings = {}
  global.botSettings.info = info

  await sock.sendMessage(m.chat,{
   text:`╭══〘 ℹ️ 𝐒𝐄𝐓𝐈𝐍𝐅𝐎 〙══⊷❍
┃ ${toSmallCaps("bot info updated")}
┃ ${info}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e)}
}
};
