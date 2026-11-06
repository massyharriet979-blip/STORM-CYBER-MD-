function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"autoview",
alias:["autoviewstatus","viewstatus"],
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

  let botId = sock.user?.id?.split(":")[0] || m.botNumber || "main"
  if(!global.subBotSettings) global.subBotSettings = {}
  if(!global.subBotSettings[botId]) global.subBotSettings[botId] = {}

  let action = args[0]?.toLowerCase()
  let current = global.subBotSettings[botId].autoview || false

  if(!action){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 👁️ 𝐀𝐔𝐓𝐎𝐕𝐈𝐄𝐖 〙══⊷❍
┃ ${toSmallCaps("usage")}: .autoview on / off
┃ ${toSmallCaps("current for this bot")}: ${current ? "ON" : "OFF"}
┃ ${toSmallCaps("bot")}: ${botId}
┃ ${toSmallCaps("only affects this subbot, not others")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  if(action === "on") global.subBotSettings[botId].autoview = true
  else if(action === "off") global.subBotSettings[botId].autoview = false
  else return sock.sendMessage(m.chat,{text:toSmallCaps("use on or off")},{quoted:m})

  await sock.sendMessage(m.chat,{
   text:`╭══〘 👁️ 𝐀𝐔𝐓𝐎𝐕𝐈𝐄𝐖 〙══⊷❍
┃ ${toSmallCaps("autoview")} ${action.toUpperCase()}
┃ ${toSmallCaps("for this subbot only")}: ${botId}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e)}
}
};
