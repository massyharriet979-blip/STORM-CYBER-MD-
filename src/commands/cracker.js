function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"cracker",
alias:["crack","passcrack"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{
    text:`╭━━━〘 🔐 〙━━━╮
┃ ${toSmallCaps("quantum clearance required")}
┃ ${toSmallCaps("owner only")}
╰━━━━━━━━━━━━╯`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"🔓",key:m.key}}).catch(()=>{})

  let input = args.join(" ")
  if(!input){
   return sock.sendMessage(m.chat,{
    text:`${toSmallCaps("what to crack sim?")}\n>.cracker facebook login\n${toSmallCaps("`..........................................................`")}`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{
   text:`${toSmallCaps("cracker loading")}...\n${toSmallCaps(`target: ${input}`)}\n${toSmallCaps("bruteforce: enable [sim]")}`
  },{quoted:m})

  await new Promise(r=>setTimeout(r,1000))
  await sock.sendMessage(m.chat,{react:{text:"⚙️",key:m.key}}).catch(()=>{})
  await new Promise(r=>setTimeout(r,1000))

  let txt=`
╭══〘 🔓 𝐂𝐑𝐀𝐂𝐊𝐄𝐑 𝐒𝐈𝐌 〙══⊷❍
┃ ${toSmallCaps(`input: ${input}`)}
┃ ${toSmallCaps(`method: dictionary [simulated]`)}
┃ ${toSmallCaps(`attempts: ${attempts} real`)}
┃ ${toSmallCaps(`result: sim only`)}
┃ ${toSmallCaps(`status: simulation complete`)}
┃
┃ ${toSmallCaps("password cracked - ui only")}
╰═══════════════════⊷❍
> ${toSmallCaps("kira cracker")}
`

  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
}
