function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"promote",
aliases:["makeadmin","admin"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required")}`},{quoted:m});
 let botId=m.botNumber || sock.user.id.split(':')[0];
 let botJid=botId+'@s.whatsapp.net';
 let isBotAdmin=meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin;
 if(!isBotAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("bot must be admin")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"⬆️",key:m.key}});

 let target=m.mentionedJid[0] || (m.quoted? m.quoted.sender: null);
 if(!target) return await sock.sendMessage(m.chat,{text:`${toSC("mention a user or reply")}`},{quoted:m});

 try{
  await sock.groupParticipantsUpdate(m.chat,[target],"promote");
  await sock.sendMessage(m.chat,{text:`@${target.split('@')[0]} HAS BEEN PROMOTED TO ADMINS\n\n> STORM CYBER MD`, mentions:[target]});
 }catch{
  await sock.sendMessage(m.chat,{text:`❌ ${toSC("failed to promote")}`});
 }
}
}
