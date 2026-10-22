function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}
import fs from 'fs'

export default {
name:"mode",
alias:["botmode","getmode"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner && !m.isSubBotOwner){
   return sock.sendMessage(m.chat,{
    text: toSmallCaps("quantum clearance required - owner only")
   },{quoted:m})
  }

  // FIX - per-bot mode, not global
  let botId = m.botNumber || m.senderNum || ""
  let current = "public"
  try{
    let f = `./database/mode_${botId}.json`
    if(fs.existsSync(f)){
      let j = JSON.parse(fs.readFileSync(f))
      if(j.mode) current = j.mode.toLowerCase()
      else if(typeof j === "string") current = j.toLowerCase()
    } else if(!m.isSubBot){
      // main bot only - old fallback
      if(fs.existsSync('./src/database/mode.json')){
        let alt = JSON.parse(fs.readFileSync('./src/database/mode.json'))
        if(typeof alt === "string") current = alt.toLowerCase()
        else if(alt.mode) current = alt.mode.toLowerCase()
      } else if(process.env.MODE) current = process.env.MODE.toLowerCase()
    }
  }catch{}

  if(current === "private") current = "private"
  if(current === "self") current = "self"
  if(current === "public") current = "public"

  let txt = `${toSmallCaps("all bot modes listed below")}

➣ ${toSmallCaps("self")}
➣ ${toSmallCaps("private")}
➣ ${toSmallCaps("public")}

${toSmallCaps("current mode")}
➣ ${toSmallCaps(current)}

${toSmallCaps("powered by storm cyber md")}`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})
 }catch(e){console.log(e)}
}
};
