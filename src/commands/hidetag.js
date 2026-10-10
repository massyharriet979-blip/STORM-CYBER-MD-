module.exports={
name:"hidetag",
aliases:["hide","htag","tag"],
execute: async(sock,m,args)=>{
 const toSC=(s)=>{const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')};
 try{
   if(!m.isGroup){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text:`**${toSC("this command is for groups only")}**`},{quoted:m});
   }
   let text = args.join(" ");
   if(!text && m.quoted){
     text = m.quoted.message?.conversation || m.quoted.message?.extendedTextMessage?.text || m.quoted.message?.imageMessage?.caption || "";
   }
   if(!text){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text:`**${toSC("provide text to hide tag")}**\n\n**${toSC("example")} :.hidetag hello**`},{quoted:m});
   }

   await sock.sendMessage(m.chat,{react:{text:"👥",key:m.key}});

   const groupMeta = await sock.groupMetadata(m.chat);
   const participants = groupMeta.participants.map(p=>p.id);

   await sock.sendMessage(m.chat,{
     text: `**${text}**\n\n> ${toSC("powered by storm")} 𝐗`,
     mentions: participants
   },{quoted:m});

 }catch(e){
   await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
