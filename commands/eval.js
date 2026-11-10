function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"eval",
alias:["ev","execute"],
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

  let code = m.text.split(" ").slice(1).join(" ")
  if(!code){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 🧪 𝐄𝐕𝐀𝐋 〙══⊷❍
┃ ${toSmallCaps("usage")}: .eval 2+2
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  let result
  try{
   result = await eval(code)
  }catch(e){ result = e.message }

  if(typeof result === "object") result = JSON.stringify(result,null,2)
  result = String(result).slice(0,3000)

  await sock.sendMessage(m.chat,{
   text:`╭══〘 🧪 𝐄𝐕𝐀𝐋 〙══⊷❍
┃ ${toSmallCaps("result")}:
┃ ${result}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e)}
}
};
