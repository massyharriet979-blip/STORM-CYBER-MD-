function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"darknet",
alias:["dark","ᴅᴀʀᴋɴᴇᴛ","deepweb"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner can access darknet")}`},{quoted:m})
  }

  let query = args.join(" ")
  if(!query) return sock.sendMessage(m.chat,{text:`${toSmallCaps("usage:.darknet [target] e.g.darknet facebook")}`},{quoted:m})

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("connecting to tor network...")}\n${toSmallCaps("routing via:")} 🇩🇪 > 🇷🇺 > 🇨🇭`},{quoted:m})

  setTimeout(async()=>{
   await sock.sendMessage(m.chat,{text:`${toSmallCaps("searching darknet for")}: ${query}...\n${toSmallCaps("found ${leaks}`)} leaked databases")}`},{quoted:m})
  },1200)
  setTimeout(async()=>{
   let txt = `◈ ${toSmallCaps("darknet result")}

${toSmallCaps("query:")} ${query}
${toSmallCaps("leaks:")} ${leaks}`)}
${toSmallCaps("passwords:")} ${password}`)}
${toSmallCaps("credit cards:")} ${cards}`)}
${toSmallCaps("status:")} ${toSmallCaps("encrypted")}

> ${toSmallCaps("result hidden for security")}
> ${toSmallCaps("by storm cyber md")}

${toSmallCaps("                                ")}`
   await sock.sendMessage(m.chat,{text:txt},{quoted:m})
  },2800)

 }catch(e){console.log(e)}
}
}
