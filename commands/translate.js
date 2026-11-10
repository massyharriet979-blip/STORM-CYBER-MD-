function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"translate",
alias:["tr","trans","traducir"],
execute: async(sock, m, args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🌐",key:m.key}}).catch(()=>{})

  let lang = args[0]?.toLowerCase() || "en"
  let text

  if(m.quoted?.text) {
   text = m.quoted.text
   // if args[0] is lang code and no text after, use quoted
   if(args.length===1) lang = args[0]
   else if(args.length>1) {
    lang = args[0]
    text = args.slice(1).join(" ")
    if(m.quoted?.text) text = m.quoted.text
   }
  } else {
   if(args.length < 2) return sock.sendMessage(m.chat,{
    text:`╭══〘 🌐 𝐓𝐑𝐀𝐍𝐒𝐋𝐀𝐓𝐄 〙══⊷❍
┃ ${toSmallCaps("usage:.translate [lang] [text]")}
┃ ${toSmallCaps("or reply text:.translate en")}
┃ ${toSmallCaps("ex:.translate fr hello world")}
┃ ${toSmallCaps("langs: en, es, fr, de, ja, sw, lug")}
╰═══════════════════⊷❍`
   },{quoted:m})
   lang = args[0]
   text = args.slice(1).join(" ")
  }

  if(!text) return sock.sendMessage(m.chat,{text:`${toSmallCaps("no text")}`},{quoted:m})

  // free translate api
  let res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`)
  let json = await res.json()
  let translated = json?.responseData?.translatedText || toSmallCaps("failed")

  let txt=`
╭══〘 🌐 𝐓𝐑𝐀𝐍𝐒𝐋𝐀𝐓𝐄 〙══⊷❍
┃ ${toSmallCaps(`from: auto -> ${lang}`)}
┃
┃ ${toSmallCaps("original:")}
┃ ${text.slice(0,400)}
┃
┃ ${toSmallCaps("translated:")}
┃ ${translated.slice(0,400)}
╰═══════════════════⊷❍
> ${toSmallCaps("kira phantom")}
`
  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}}).catch(()=>{})

 }catch(e){
  console.log(e)
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("translate failed")}`},{quoted:m})
 }
}
}
