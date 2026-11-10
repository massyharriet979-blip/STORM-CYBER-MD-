function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"requests",
aliases:["joinrequests","pending","listrequests"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"📥",key:m.key}});

 try{
  let reqs=await sock.groupRequestParticipantsList(m.chat);
  if(!reqs || reqs.length===0){
   return await sock.sendMessage(m.chat,{text:`0 ${toSC("pendings are waiting to be approved")}\n\n> ${toSC("powered by storm cyber md")}`});
  }

  let txt=`${reqs.length} ${toSC("pendings are waiting to be approved")}\n\n`;
  let mentions=[];
  for(let r of reqs){
   let jid=r.jid||r.id;
   mentions.push(jid);
   txt+=`• @${jid.split('@')[0]}\n`;
  }

  txt+=`\n> ${toSC("powered by storm cyber md")}`;
  await sock.sendMessage(m.chat,{text:txt, mentions});
 }catch(e){
  await sock.sendMessage(m.chat,{text:`❌ ${e.message}`},{quoted:m});
 }
}
}
