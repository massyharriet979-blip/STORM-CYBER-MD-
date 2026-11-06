function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"autoapprove",
aliases:["approveall","approve"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 let botJid=sock.user.id.split(':')[0]+'@s.whatsapp.net';
 let isBotAdmin=meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin;
 if(!isBotAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("bot must be admin")}`},{quoted:m});

 try{
  let requests=await sock.groupRequestParticipantsList(m.chat).catch(()=>[]);
  if(!requests || requests.length===0){
   return await sock.sendMessage(m.chat,{text:`✅ ${toSC("no pending requests")}\n\n> ${toSC("powered by storm cyber md")}`});
  }

  let jids=requests.map(r=>r.jid||r.id);
  await sock.groupRequestParticipantsUpdate(m.chat, jids, "approve");

  await sock.sendMessage(m.chat,{text:`✅ ${toSC("approved")} ${jids.length} ${toSC("requests")}\n\n> ${toSC("powered by storm cyber md")}`});
 }catch(e){
  await sock.sendMessage(m.chat,{text:`❌ ${e.message}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
 }
}
}
