function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"hacktool",
alias:["hack","htool","toolkit"],
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

  await sock.sendMessage(m.chat,{react:{text:"🛠️",key:m.key}}).catch(()=>{})

  let input = args.join(" ") || "target"
  let tools = ["nmap","sqlmap","hydra","metasploit","wireshark"];
  let tool = tools[Math.floor(Math.random() * tools.length)];
  let ports = Math.floor(Math.random() * 9000) + 1000;

  await new Promise(r=>setTimeout(r,800))
  await sock.sendMessage(m.chat,{
   text:`${toSmallCaps("loading hacktool")} ${input} ${toSmallCaps("[sim]")}...\n${toSmallCaps("tool loaded: " + tool)}`
  },{quoted:m})

  await new Promise(r=>setTimeout(r,1200))

  let txt=`
╭══〘 🛠️ 𝐇𝐀𝐂𝐊𝐓𝐎𝐋 𝐒𝐈𝐌 〙══⊷❍
┃ ${toSmallCaps("target: " + input)}
┃ ${toSmallCaps("tool: " + tool + " [simulated]")}
┃ ${toSmallCaps("open ports: " + ports)}
┃ ${toSmallCaps("result: unblocked - sim only")}
┃ ${toSmallCaps("status: simulation complete")}
┃
┃ ${toSmallCaps("toolkit - ui only")}
╰═══════════════════⊷❍
> ${toSmallCaps("STORM CYBER MD V3")}
`

  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"☠️",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
};
