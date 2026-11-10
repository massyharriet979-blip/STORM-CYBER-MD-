import fs from "fs"

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"setvar",
alias:["setvars","setenv"],
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

  let raw = m.text || ""
  let parts = raw.split(" ").slice(1)
  let key = parts[0]
  let value = parts.slice(1).join(" ")

  if(!key || !value){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 ⚙️ 𝐒𝐄𝐓𝐕𝐀𝐑 〙══⊷❍
┃ ${toSmallCaps("usage")}: .setvar PREFIX !
┃ ${toSmallCaps("usage")}: .setvar BOTNAME STORM
┃ ${toSmallCaps("usage")}: .setvar MODE public
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  key = key.toUpperCase()
  process.env[key] = value
  if(!global.botSettings) global.botSettings = {}
  global.botSettings[key] = value
  global.botSettings[key.toLowerCase()] = value

  try{
   let envPath = ".env"
   let content = fs.existsSync(envPath) ? fs.readFileSync(envPath,"utf8") : ""
   let lines = content.split("\n").filter(l=>!l.startsWith(key+"="))
   lines.push(`${key}=${value}`)
   fs.writeFileSync(envPath, lines.join("\n"))
  }catch{}

  let display = /TOKEN|KEY|PASS|SECRET|SESSION|AUTH/i.test(key) ? "••••••••" : value

  await sock.sendMessage(m.chat,{
   text:`╭══〘 ⚙️ 𝐒𝐄𝐓𝐕𝐀𝐑 〙══⊷❍
┃ ${key} = ${display}
┃ ${toSmallCaps("saved successfully")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e)}
}
};
