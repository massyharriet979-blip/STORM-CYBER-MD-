module.exports={
name:"vv",
aliases:["viewonce","vv2"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };

 try{
   const config = require('../../config');
   let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
   let sender=m.sender.split("@")[0]
   let isOwner = sender===botId
   let isSudo = config.SUDO? config.SUDO.includes(sender) || config.SUDO.includes(m.sender) : false
   let isSubBot = m.isSubBot || false
   let isAdmin = m.isGroup? (m.isAdmin || false) : false

   // Check: owner/sudo/subbot/admin = YES, local = NO
   if(!isOwner &&!isSudo &&!isSubBot &&!isAdmin){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text:`${toSC("quantum clearance required")}\n${toSC("owner or sudo only")}\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m})
   }

   let q = m.quoted? m.quoted : null;
   if(!q){
     await sock.sendMessage(m.chat,{react:{text:"❓",key:m.key}});
     return await sock.sendMessage(m.chat,{text:toSC("reply to a view once message")},{quoted:m})
   }

   // react success
   await sock.sendMessage(m.chat,{react:{text:"👁️",key:m.key}});

   let viewOnce = q.msg?.viewOnceMessage || q.msg?.viewOnceMessageV2 || q.msg?.viewOnceMessageV2Extension;
   let inner = viewOnce?.message || q.msg;

   if(!inner){
     return await sock.sendMessage(m.chat,{text:toSC("no view once found")},{quoted:m})
   }

   // This will reply to your msg AND subbot msg - both work
   // It forwards the viewonce as normal message
   await sock.sendMessage(m.chat,{forward: inner},{quoted:m});

   await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
   await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
   await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m})
 }
}
}
