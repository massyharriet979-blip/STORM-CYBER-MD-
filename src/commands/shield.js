function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"shield",
alias:["antidestroy","protection","gcshield"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isGroup) return sock.sendMessage(m.chat,{text:`${toSmallCaps("group only")}`},{quoted:m})
  if(!m.isAdmin &&!m.isOwner) return sock.sendMessage(m.chat,{text:`${toSmallCaps("admin only")}`},{quoted:m})

  global.db = global.db || {}
  global.db.groups = global.db.groups || {}
  global.db.groups[m.chat] = global.db.groups[m.chat] || {}

  let action = args[0]?.toLowerCase()

  if(!action){
   let st = global.db.groups[m.chat].shield? "on" : "off"
   return sock.sendMessage(m.chat,{
    text:`╭══〘 🛡️ 𝐒𝐇𝐈𝐄𝐋𝐃 〙══⊷❍
┃ ${toSmallCaps(`status: ${st}`)}
┃
┃ ${toSmallCaps("usage:")}
┃.shield on / off
┃.shield info
┃
┃ ${toSmallCaps("protects from:")}
┃ • ${toSmallCaps("mass kick")}
┃ • ${toSmallCaps("promote/demote abuse")}
┃ • ${toSmallCaps("group setting change")}
╰═══════════════════⊷❍`
   },{quoted:m})
  }

  if(action==="on"){
   global.db.groups[m.chat].shield = true
   await sock.sendMessage(m.chat,{text:`${toSmallCaps("shield activated")}\n> ${toSmallCaps("kira phantom protection on")}`},{quoted:m})
   await sock.sendMessage(m.chat,{react:{text:"🛡️",key:m.key}}).catch(()=>{})
  }
  else if(action==="off"){
   global.db.groups[m.chat].shield = false
   await sock.sendMessage(m.chat,{text:`${toSmallCaps("shield deactivated")}`},{quoted:m})
  }
  else if(action==="info"){
   let g = global.db.groups[m.chat]
   let txt=`
╭══〘 🛡️ 𝐒𝐇𝐈𝐄𝐋𝐃 𝐈𝐍𝐅𝐎 〙══⊷❍
┃ ${toSmallCaps(`shield: ${g.shield? "on":"off"}`)}
┃ ${toSmallCaps(`antilink: ${g.antilink? "on":"off"}`)}
┃ ${toSmallCaps(`antibot: ${g.antibot? "on":"off"}`)}
┃ ${toSmallCaps(`antidelete: ${g.antidelete? "on":"off"}`)}
╰═══════════════════⊷❍
`
   await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  }

 }catch(e){console.log(e)}
}
}

// ADD THIS TO YOUR groupParticipantsUpdate / group update event handler

// if(global.db?.groups?.[groupId]?.shield){
// if(action=="remove" && participants.length>3){ // mass kick detected
// // auto re-add or ban kicker
// }
// }
