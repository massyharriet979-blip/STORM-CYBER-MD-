function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"autostatus",
alias:["autostatusview","statusview"],
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

  // PER SUBBOT - keyed by bot number, not global
  let botId = sock.user?.id?.split(":")[0] || m.botNumber || "main"
  if(!global.subBotSettings) global.subBotSettings = {}
  if(!global.subBotSettings[botId]) global.subBotSettings[botId] = {}

  let action = args[0]?.toLowerCase()
  let current = global.subBotSettings[botId].autostatus || false

  if(!action){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 👁️ 𝐀𝐔𝐓𝐎𝐒𝐓𝐀𝐓𝐔𝐒 〙══⊷❍
┃ ${toSmallCaps("usage")}: .autostatus on / off
┃ ${toSmallCaps("current for this bot")}: ${current ? "ON" : "OFF"}
┃ ${toSmallCaps("bot")}: ${botId}
┃ ${toSmallCaps("AUTOSTATUS MAY NOT BE AVAILABLE")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  if(action === "on"){
   global.subBotSettings[botId].autostatus = true
  } else if(action === "off"){
   global.subBotSettings[botId].autostatus = false
  } else {
   return sock.sendMessage(m.chat,{text:toSmallCaps("use on or off")},{quoted:m})
  }

  await sock.sendMessage(m.chat,{
   text:`╭══〘 👁️ 𝐀𝐔𝐓𝐎𝐒𝐓𝐀𝐓𝐔𝐒 〙══⊷❍
┃ ${toSmallCaps("autostatus")} ${action.toUpperCase()}
┃ ${toSmallCaps("for this bot only")}: ${botId}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e)}
}
};
