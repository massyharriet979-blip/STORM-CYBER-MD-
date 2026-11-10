function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"wifihack",
alias:["wifirecover","mywifi"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{
    text:`╭━━━〘 🔐 〙━━━╮
┃ ${toSmallCaps("quantum clearance required")}
┃ ${toSmallCaps("owner only")}
┃ ${toSmallCaps("access denied")}
╰━━━━━━━━━━━━╯`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"📶",key:m.key}}).catch(()=>{})

  let txt=`
╭══〘 📶 𝐖𝐈𝐅𝐈 𝐑𝐄𝐂𝐎𝐕𝐄𝐑𝐘 〙══⊷❍
┃ ${toSmallCaps("mode: own wifi recovery only")}
┃
┃ ${toSmallCaps("method 1: check router sticker")}
┃ ${toSmallCaps("look under router for password / pin")}
┃
┃ ${toSmallCaps("method 2: admin panel")}
┃ ${toSmallCaps("connect to wifi box via cable or phone") }
┃ ${toSmallCaps("go to 192.168.1.1 or 192.168.0.1")}
┃ ${toSmallCaps("login: admin / admin")}
┃ ${toSmallCaps("find wireless > security > show pass")}
┃
┃ ${toSmallCaps("method 3: windows pc that was connected")}
┃ ${toSmallCaps("netsh wlan show profile name=wifiname key=clear")}
┃
┃ ${toSmallCaps("method 4: reset if yours")}
┃ ${toSmallCaps("hold reset 10s then setup new pass")}
┃
┃ ${toSmallCaps("status: no hacking - legit recovery")}
╰═══════════════════⊷❍
> ${toSmallCaps("use only for your own router")}
`

  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
}
