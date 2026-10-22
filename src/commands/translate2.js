function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"translate2",
alias:["tr2","trans2"],
execute: async(sock, m, args)=>{
 try{
  // Restricted - only SubBot owner, local users blocked
  if(!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{
    text: `${toSmallCaps("quantum clearance required")}\n${toSmallCaps("owner only")}`
   },{quoted:m})
  }

  let text = args.join(" ")
  if(!text){
   return sock.sendMessage(m.chat,{
    text: `${toSmallCaps("usage")}: .translate2 <lang> <text>\n${toSmallCaps("example")}: .translate2 en hello world\n${toSmallCaps("example")}: .translate2 fr bonjour`
   },{quoted:m})
  }

  // Format: .translate2 en hello world OR .translate2 hello world (default to en)
  let parts = text.split(" ")
  let targetLang = "en"
  let toTranslate = text

  if(parts.length > 1 && parts[0].length <= 5 && /^[a-z]{2,5}$/.test(parts[0].toLowerCase())){
   targetLang = parts[0].toLowerCase()
   toTranslate = parts.slice(1).join(" ")
  }

  await sock.sendMessage(m.chat,{react:{text:"🌐",key:m.key}}).catch(()=>{})

  try{
   let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(toTranslate)}`
   let res = await fetch(url).then(r=>r.json())
   let translated = res[0].map(x=>x[0]).join("")
   let detected = res[2] || "auto"

   return sock.sendMessage(m.chat,{
    text: `${toSmallCaps("translated")}: ${translated}\n${toSmallCaps("from")}: ${detected} ${toSmallCaps("to")}: ${targetLang}\n${toSmallCaps("original")}: ${toTranslate}`
   },{quoted:m})
  }catch{
   return sock.sendMessage(m.chat,{
    text: `${toSmallCaps("translation failed, try again")}`
   },{quoted:m})
  }

 }catch(e){console.log(e)}
}
};
