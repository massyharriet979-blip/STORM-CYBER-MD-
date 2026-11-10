function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"end",
aliases:["endgroup","kickall","close"],
execute: async(sock,m)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});

 let meta = await sock.groupMetadata(m.chat);
 let isSenderAdmin = meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isSenderAdmin){
  return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("admins or owner only")}`},{quoted:m});
 }

 let botJid = sock.user.id.split(':')[0]+'@s.whatsapp.net';
 let isBotAdmin = meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin;
 if(!isBotAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("bot must be admin")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"💀",key:m.key}});

 let toKick = meta.participants.filter(p=>p.id!==botJid && p.id!==sock.user.id && p.id!==m.sender).map(p=>p.id);

 if(toKick.length===0){
  return await sock.sendMessage(m.chat,{text: `${toSC("no members to kick")}`},{quoted:m});
 }

 await sock.sendMessage(m.chat,{text:`${toSC("group ended")} 💀\n${toSC("kicking")} ${toKick.length} ${toSC("members")}...`},{quoted:m});

 for(let jid of toKick){
  try{
   await sock.groupParticipantsUpdate(m.chat, [jid], "remove");
   await new Promise(r=>setTimeout(r,1500));
  }catch{}
 }

 return await sock.sendMessage(m.chat,{text:`${toSC("done")} ✅\n${toSC("group ended, all kicked")}\n@${m.sender.split('@')[0]} ${toSC("remains")}`, mentions:[m.sender]},{quoted:m});
}
}
