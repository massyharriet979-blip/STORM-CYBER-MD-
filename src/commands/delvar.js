import fs from "fs"

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"delvar",
alias:["deletevar","delvars"],
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
    text:`╭══〘 🗑️ 𝐃𝐄𝐋𝐕𝐀𝐑 〙══⊷❍
┃ ${toSmallCaps("usage")}: .delvar PREFIX
┃ ${toSmallCaps("usage")}: .delvar MODE
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  key = key.toUpperCase()
  delete process.env[key]
  if(global.botSettings){
   delete global.botSettings[key]
   delete global.botSettings[key.toLowerCase()]
  }

  try{
   let envPath = ".env"
   if(fs.existsSync(envPath)){
    let content = fs.readFileSync(envPath,"utf8")
    let lines = content.split("\n").filter(l=>!l.startsWith(key+"="))
    fs.writeFileSync(envPath, lines.join("\n"))
   }
  }catch{}

  await sock.sendMessage(m.chat,{
   text:`╭══〘 🗑️ 𝐃𝐄𝐋𝐕𝐀𝐑 〙══⊷❍
┃ ${key} ${toSmallCaps("deleted successfully")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e)}
}
};
