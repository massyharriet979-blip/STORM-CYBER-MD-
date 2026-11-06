function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"userid",
alias:["id","uid","getid","jid"],
execute: async(sock, m, args)=>{
 try{
  let target
  if(m.mentionedJid && m.mentionedJid[0]) target = m.mentionedJid[0]
  else if(m.quoted?.sender) target = m.quoted.sender
  else target = m.sender

  let user = target.split("@")[0]
  let jid = target

  let txt = `${toSmallCaps("user id:")} ${user}\n${toSmallCaps("jid:")} ${jid}\n\n> powered by storm x`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})

 }catch(e){console.log(e)}
}
}
