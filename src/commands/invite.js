function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"invite",
aliases:["invitelink","grouplink","linkgc"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"🔗",key:m.key}});

 try{
  let code=await sock.groupInviteCode(m.chat);
  let link=`https://chat.whatsapp.com/${code}`;
  let txt=`🔗 ${toSC("group invite link for")} ${meta.subject}\n\n${link}\n\n> ${toSC("powered by storm cyber md")}`;
  await sock.sendMessage(m.chat,{text:txt},{quoted:m});

  // if mentioned user, send link to them
  if(m.mentionedJid[0]){
   await sock.sendMessage(m.chat,{text:`@${m.mentionedJid[0].split('@')[0]} ${toSC("here is invite link")}: ${link}`, mentions:m.mentionedJid});
  }
 }catch(e){
  await sock.sendMessage(m.chat,{text:`❌ ${toSC("failed to get invite link, bot must be admin")}`});
 }
}
}
