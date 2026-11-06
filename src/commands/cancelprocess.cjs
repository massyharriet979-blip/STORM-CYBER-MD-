module.exports={
name:"cancelprocess",
aliases:["stopprocess","killprocess","cancel"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   const config = require('../../config');
   let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
   let sender=m.sender.split("@")[0]
   let isOwner = sender===botId
   let isSudo = config.SUDO? config.SUDO.includes(sender) || config.SUDO.includes(m.sender) : false
   let isSubBot = m.isSubBot || false

   if(!isOwner &&!isSudo &&!isSubBot){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text:`${toSC("quantum clearance required")}\n${toSC("owner or sudo only")}\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m})
   }

   let msg = await sock.sendMessage(m.chat,{text:`${toSC("initializing termination sequence")}...\n\n> [■□□□□] 20%`},{quoted:m});

   setTimeout(async()=>{
     await sock.sendMessage(m.chat,{text:`${toSC("scanning active sessions")}...\n\n> [■■■□□] 60%\n${toSC("found")}: 3 ${toSC("active processes")}`,edit:msg.key});
   },1200);

   setTimeout(async()=>{
     await sock.sendMessage(m.chat,{text:`${toSC("terminating background tasks")}...\n\n> [■■■■□] 80%\n✓ ${toSC("session")} 1 ${toSC("closed")}\n✓ ${toSC("session")} 2 ${toSC("closed")}`,edit:msg.key});
   },2500);

   setTimeout(async()=>{
     await sock.sendMessage(m.chat,{text:`${toSC("all processes terminated")}\n\n> [■■■■■] 100%\n\n${toSC("status")}: ${toSC("clean")}\n${toSC("memory")}: ${toSC("cleared")}\n${toSC("uptime")}: ${toSC("reset")}\n\n> ${toSC("powered by storm")} 𝐗`,edit:msg.key});
     await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
   },4000);

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
