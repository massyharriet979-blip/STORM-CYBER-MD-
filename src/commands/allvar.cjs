function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"allvar",
alias:["allvars","getallvar","listvars"],
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

  let settings = global.botSettings || {}
  let envKeys = Object.keys(process.env).filter(k=>["PREFIX","BOTNAME","MODE","OWNER_NUMBER","OWNER_NAME","REPO_URL","SESSION_ID","BOT_VERSION"].includes(k))

  let list = ""
  if(Object.keys(settings).length === 0 && envKeys.length === 0){
   list = toSmallCaps("no vars set")
  } else {
   for(let k of Object.keys(settings)){
    let v = String(settings[k])
    if(/TOKEN|KEY|PASS|SECRET|SESSION|AUTH/i.test(k)) v = "••••••••"
    list += `┃ ${k} = ${v}\n`
   }
   for(let k of envKeys){
    if(settings[k]) continue
    let v = String(process.env[k])
    if(/TOKEN|KEY|PASS|SECRET|SESSION|AUTH/i.test(k)) v = "••••••••"
    list += `┃ ${k} = ${v}\n`
   }
  }

  await sock.sendMessage(m.chat,{
   text:`╭══〘 📋 𝐀𝐋𝐋𝐕𝐀𝐑 〙══⊷❍
┃ ${toSmallCaps("all variables")}
┃
${list}╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e)}
}
};
