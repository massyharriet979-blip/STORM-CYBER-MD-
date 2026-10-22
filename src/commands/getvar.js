function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"getvar",
alias:["getvars"],
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

  let key = args[0]
  if(!key){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 📥 𝐆𝐄𝐓𝐕𝐀𝐑 〙══⊷❍
┃ ${toSmallCaps("usage")}: .getvar PREFIX
┃ ${toSmallCaps("usage")}: .getvar MODE
┃ ${toSmallCaps("usage")}: .getvar BOTNAME
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  key = key.toUpperCase()
  let val = process.env[key] || global.botSettings?.[key] || global.botSettings?.[key.toLowerCase()] || "Not set"

  if(/TOKEN|KEY|PASS|SECRET|SESSION|AUTH/i.test(key)) val = "••••••••"

  await sock.sendMessage(m.chat,{
   text:`╭══〘 📥 𝐆𝐄𝐓𝐕𝐀𝐑 〙══⊷❍
┃ ${key} = ${val}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e)}
}
};
