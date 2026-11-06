function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"vcard",
alias:["ᴠᴄᴀʀᴅ","contact","card"],
execute: async(sock, m, args)=>{
 try{
  // QUANTUM CLEARANCE REQUIRED, OWNER ONLY
  if(!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{
      text:`◈ ${toSmallCaps("quantum clearance required")}\n${toSmallCaps("owner only command")}`
    },{quoted:m})
  }

  let who = m.quoted?.sender || m.mentionedJid?.[0] || m.sender

  let name = args.join(" ") || "Storm Cyber"
  let number = who.split("@")[0]

  if(args[0] && args[0].includes("@")){
    who = m.mentionedJid[0]
    number = who.split("@")[0]
    name = args.slice(1).join(" ") || await sock.getName(who) || "Contact"
  }

  let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:STORM CYBER MD;\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`

  await sock.sendMessage(m.chat,{
    contacts:{
      displayName: name,
      contacts:[{vcard}]
    }
  },{quoted:m})

  await sock.sendMessage(m.chat,{
    text:`◈ ᴠᴄᴀʀᴅ [ǫᴜᴀɴᴛᴜᴍ]\n\n${toSmallCaps("name")}: ${name}\n${toSmallCaps("number")}: +${number}\n\n> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
