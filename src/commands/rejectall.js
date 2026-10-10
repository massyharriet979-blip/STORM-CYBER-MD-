function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"rejectall",
aliases:["reject","declineall","cancelall"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});

 try{
  let pending=await sock.groupRequestParticipantsList(m.chat).catch(()=>[]);
  if(!pending || pending.length===0){
   return await sock.sendMessage(m.chat,{text:`${toSC("no pending requests")}\n\n> ${toSC("powered by storm cyber md")}`});
  }
  let count=pending.length;
  let jids=pending.map(p=>p.jid || p.id);

  for(let jid of jids){
   try{
    await sock.groupRequestParticipantsUpdate(m.chat,[jid],"reject").catch(()=>{});
    await new Promise(r=>setTimeout(r,400));
   }catch{}
  }

  let txt=`ALL ${count} REQUESTS HAVE BEEN REJECTED FROM ${meta.subject}\n\nREJECTED\n\n> STORM CYBER MD`;
  await sock.sendMessage(m.chat,{text:txt});
 }catch(e){
  await sock.sendMessage(m.chat,{text:`❌ ${toSC("failed")}: ${e.message}\n\n> ${toSC("powered by storm cyber md")}`});
 }
}
}
