function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

const fonts = {
  smallcaps: (t)=> toSmallCaps(t),
  bold: (t)=> t.split('').map(c=>{let code=c.charCodeAt(0); if(code>=65&&code<=90) return String.fromCodePoint(0x1D400+code-65); if(code>=97&&code<=122) return String.fromCodePoint(0x1D41A+code-97); return c}).join(''),
  italic: (t)=> t.split('').map(c=>{let code=c.charCodeAt(0); if(code>=65&&code<=90) return String.fromCodePoint(0x1D434+code-65); if(code>=97&&code<=122) return String.fromCodePoint(0x1D44E+code-97); return c}).join(''),
  mono: (t)=> t.split('').map(c=>{let code=c.charCodeAt(0); if(code>=65&&code<=90) return String.fromCodePoint(0x1D670+code-65); if(code>=97&&code<=122) return String.fromCodePoint(0x1D68A+code-97); return c}).join(''),
  double: (t)=> t.split('').map(c=>{let code=c.charCodeAt(0); if(code>=65&&code<=90) return String.fromCodePoint(0x1D538+code-65); if(code>=97&&code<=122) return String.fromCodePoint(0x1D552+code-97); return c}).join(''),
  gothic: (t)=> t.split('').map(c=>{let code=c.charCodeAt(0); if(code>=65&&code<=90) return String.fromCodePoint(0x1D504+code-65); if(code>=97&&code<=122) return String.fromCodePoint(0x1D51E+code-97); return c}).join(''),
}

export default {
name:"styletext",
alias:["sᴛʏʟᴇᴛᴇxᴛ","fancy","font"],
execute: async(sock, m, args)=>{
 try{
  // QUANTUM CLEARANCE REQUIRED, OWNER ONLY
  if(!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{
      text:`◈ ${toSmallCaps("quantum clearance required")}\n${toSmallCaps("owner only command")}`
    },{quoted:m})
  }

  if(!args[0]){
    return sock.sendMessage(m.chat,{
      text:`◈ sᴛʏʟᴇᴛᴇxᴛ [ǫᴜᴀɴᴛᴜᴍ]

${toSmallCaps("usage")}:
.styletext <text>

${toSmallCaps("example")}:
.styletext Storm Cyber

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
    },{quoted:m})
  }

  let text = args.join(" ")
  let list = []

  for(let name in fonts){
    try{ list.push(`*${name.toUpperCase()}*: ${fonts[name](text)}`) }catch{}
  }

  // extra styles from api
  try{
    let res = await fetch(`https://api.akuari.my.id/other/styletext?text=${encodeURIComponent(text)}`)
    let json = await res.json()
    if(json.result){
      json.result.forEach(r=>{
        list.push(`*${r.name.toUpperCase()}*: ${r.result}`)
      })
    }
  }catch{}

  let finalText = `◈ sᴛʏʟᴇᴛᴇxᴛ [ǫᴜᴀɴᴛᴜᴍ]\n\n${toSmallCaps("text")}: ${text}\n\n${list.join("\n\n")}\n\n> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{text: finalText},{quoted:m})

 }catch(e){console.log(e)}
}
}
