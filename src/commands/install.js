import fs from "fs"
import path from "path"

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"install",
alias:["addplugin","installplugin"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner && !m.isSubBotOwner){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 🔐 〙══⊷❍\n┃ ${toSmallCaps("quantum clearance required")}\n┃ ${toSmallCaps("owner only")}\n╰═══════════════════⊷❍\n> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  let url = args[0] || m.quoted?.text || ""
  if(!url || !url.startsWith("http")){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 📦 𝐈𝐍𝐒𝐓𝐀𝐋𝐋 〙══⊷❍
┃ ${toSmallCaps("usage")}: .install <url>
┃ ${toSmallCaps("example")}: .install https://pastebin.com/raw/xxxx
┃ ${toSmallCaps("or reply to a code file")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"📦",key:m.key}}).catch(()=>{})

  try{
   let code = await fetch(url).then(r=>r.text())
   let name = args[1] || `plugin_${Date.now()}.js`
   if(!name.endsWith(".js")) name += ".js"
   let dir = "src/commands"
   if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true})
   fs.writeFileSync(path.join(dir,name), code)

   let txt = `
╭══〘 📦 𝐈𝐍𝐒𝐓𝐀𝐋𝐋𝐄𝐃 〙══⊷❍
┃ ${toSmallCaps("file")}: ${name}
┃ ${toSmallCaps("size")}: ${code.length} ${toSmallCaps("chars")}
┃ ${toSmallCaps("status")}: ${toSmallCaps("installed successfully")}
┃ ${toSmallCaps("reload bot to activate")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}
`
   await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  }catch(e){
   await sock.sendMessage(m.chat,{text:`${toSmallCaps("install failed")}: ${e.message}`},{quoted:m})
  }
 }catch(e){console.log(e)}
}
};
