function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"broadcast",
alias:["bc","announce"],
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

  let msg = args.join(" ")
  if(!msg){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 📢 𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓 〙══⊷❍
┃ ${toSmallCaps("usage")}: .broadcast hello everyone
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  let chats = await sock.groupFetchAllParticipating().catch(()=>({}))
  let groups = Object.keys(chats)
  let count = 0

  await sock.sendMessage(m.chat,{text:toSmallCaps(`broadcasting to ${groups.length} groups...`)},{quoted:m})

  for(let id of groups){
   try{
    await sock.sendMessage(id,{
     text:`╭══〘 📢 𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓 〙══⊷❍
┃ ${msg}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
    })
    count++
    await new Promise(r=>setTimeout(r,1500))
   }catch{}
  }

  await sock.sendMessage(m.chat,{
   text:`╭══〘 📢 𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓 〙══⊷❍
┃ ${toSmallCaps("broadcast done")}
┃ ${toSmallCaps("sent to")}: ${count} ${toSmallCaps("groups")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e)}
}
};
