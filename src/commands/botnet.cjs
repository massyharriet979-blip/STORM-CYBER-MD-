function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"botnet",
alias:["netbot","kiratnet"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return
  }
  await sock.sendMessage(m.chat,{react:{text:"🕸️",key:m.key}}).catch(()=>{})

  let target = m.mentionedJid?.[0] || m.quoted?.sender
  if(!target && args[0]){
   let num=args[0].replace(/[^0-9]/g,'')
   if(num) target=num+"@s.whatsapp.net"
  }

  let name = target? target.split('@')[0] : "global"
  let nodes = Math.floor(Math.random()*500)+100

  await new Promise(r=>setTimeout(r,900))
  await sock.sendMessage(m.chat,{react:{text:"🤖",key:m.key}}).catch(()=>{})
  await new Promise(r=>setTimeout(r,1100))

  let txt=`
╭══〘 🕸️ 𝐁𝐎𝐓𝐍𝐄𝐓 𝐒𝐈𝐌 〙══⊷❍
┃ ${toSmallCaps(`target: @${name}`)}
┃ ${toSmallCaps(`nodes: ${nodes} [simulated]`)}
┃ ${toSmallCaps(`zombies: ${number} real - ui only`)}
┃ ${toSmallCaps(`c2: connecting`)}
┃ ${toSmallCaps(`action: taking - simulation`)}
┃ ${toSmallCaps(`status: simulation complete`)}
┃
┃ ${toSmallCaps("roleplay ui, no network control")}
╰═══════════════════⊷❍
> ${toSmallCaps("kira network")}
`

  await sock.sendMessage(m.chat,{
   text:txt.trim(),
   mentions: target? [target]:[]
  },{quoted:m})

  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
}
