module.exports={
name:"getjids",
aliases:["jids","getjid","gjid"],
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

   await sock.sendMessage(m.chat,{react:{text:"🔍",key:m.key}});

   let jids=[];
   let allChats = Object.keys(sock.chats||{});

   let groups = allChats.filter(j=>j.endsWith("@g.us"));
   let users = allChats.filter(j=>j.endsWith("@s.whatsapp.net"));
   let channels = allChats.filter(j=>j.endsWith("@newsletter"));
   let lid = allChats.filter(j=>j.endsWith("@lid"));

   let text = `${toSC("cyber-md jid extractor")}\n\n`;

   text+=`${toSC("current chat")}: \n${m.chat}\n\n`;
   if(m.quoted) text+=`${toSC("quoted user")}: \n${m.quoted.sender}\n\n`;
   text+=`${toSC("sender")}: \n${m.sender}\n\n`;

   text+=`${toSC("stats")}:\n`;
   text+=`• ${toSC("groups")}: ${groups.length}\n`;
   text+=`• ${toSC("users")}: ${users.length}\n`;
   text+=`• ${toSC("channels")}: ${channels.length}\n`;
   text+=`• ${toSC("lid chats")}: ${lid.length}\n\n`;

   text+=`${toSC("all group jids")}:\n${groups.slice(0,20).join("\n")}${groups.length>20?`\n...${toSC("and")} ${groups.length-20} ${toSC("more")}`:""}\n\n`;

   text+=`${toSC("all channel jids")}:\n${channels.join("\n")||toSC("none")}\n\n`;

   text+=`> ${toSC("powered by storm")} 𝐗`;

   await sock.sendMessage(m.chat,{text},{quoted:m});
   await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
