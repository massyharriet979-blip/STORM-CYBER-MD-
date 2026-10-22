import fs from "fs"
import path from "path"

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"plugin",
alias:["plugins","listplugin"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner && !m.isSubBotOwner){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 🔐 〙══⊷❍\n┃ ${toSmallCaps("quantum clearance required")}\n┃ ${toSmallCaps("owner only")}\n╰═══════════════════⊷❍\n> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  let dir = "src/commands"
  let files = []
  try{ files = fs.readdirSync(dir).filter(f=>f.endsWith(".js")).sort() }catch{}

  let list = files.map((f,i)=>`${i+1}. ${f}`).join("\n") || "No plugins"

  let txt = `
╭══〘 🔌 𝐏𝐋𝐔𝐆𝐈𝐍𝐒 〙══⊷❍
┃ ${toSmallCaps("total plugins")}: ${files.length}
┃
┃ ${list}
┃
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}
`
  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"🔌",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
};
