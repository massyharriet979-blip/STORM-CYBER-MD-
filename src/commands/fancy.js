function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"fancy",
alias:["ғᴀɴᴄʏ","fonts","style"],
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
      text:`◈ ғᴀɴᴄʏ [ǫᴜᴀɴᴛᴜᴍ]

${toSmallCaps("usage")}:
.fancy <text> |.fancy <number> <text>

${toSmallCaps("example")}:
.fancy Storm
.fancy 10 Storm Cyber

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
    },{quoted:m})
  }

  let num = parseInt(args[0])
  let text = args.join(" ")

  if(!isNaN(num)){
    text = args.slice(1).join(" ")
  } else {
    num = null
  }

  if(!text) text = "Storm"

  let res = await fetch(`https://api.akuari.my.id/other/styletext?text=${encodeURIComponent(text)}`)
  let json = await res.json()

  let list = json.result || json.data || []

  if(list.length===0){
    list = [
      {name:"Bold", result: text.split('').map(c=>{let k=c.charCodeAt(0); if(k>=65&&k<=90) return String.fromCodePoint(0x1D400+k-65); if(k>=97&&k<=122) return String.fromCodePoint(0x1D41A+k-97); return c}).join('')},
      {name:"Italic", result: text.split('').map(c=>{let k=c.charCodeAt(0); if(k>=65&&k<=90) return String.fromCodePoint(0x1D434+k-65); if(k>=97&&k<=122) return String.fromCodePoint(0x1D44E+k-97); return c}).join('')},
      {name:"SmallCaps", result: toSmallCaps(text)},
    ]
  }

  if(num!==null && list[num-1]){
    return sock.sendMessage(m.chat,{
      text:`◈ ғᴀɴᴄʏ ${num} [ǫᴜᴀɴᴛᴜᴍ]\n\n${list[num-1].result}\n\n> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
    },{quoted:m})
  }

  let final = list.slice(0,30).map((r,i)=>`${i+1}. ${r.result}`).join("\n")

  await sock.sendMessage(m.chat,{
    text:`◈ ғᴀɴᴄʏ [ǫᴜᴀɴᴛᴜᴍ]

${toSmallCaps("text")}: ${text}

${final}

${toSmallCaps("use")}:.fancy <number> <text> ${toSmallCaps("to copy one")}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
