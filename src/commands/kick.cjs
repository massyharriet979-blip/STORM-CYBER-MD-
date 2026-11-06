function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"kick",
aliases:["remove"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"🦶",key:m.key}});

 let botJid=sock.user.id.split(':')[0]+'@s.whatsapp.net';
 let isBotAdmin=meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin;
 if(!isBotAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("bot must be admin")}`},{quoted:m});

 let target=null;
 if(m.quoted) target=m.quoted.sender;
 else if(m.mentionedJid && m.mentionedJid[0]) target=m.mentionedJid[0];
 else if(args[0]){
  let num=args[0].replace(/[^0-9]/g,'');
  if(num) target=num+'@s.whatsapp.net';
 }

 if(!target) return await sock.sendMessage(m.chat,{text:`${toSC("usage")}:\n.kick @user\n${toSC("or reply")}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});

 if(target===botJid || target===sock.user.id) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("cant kick bot")}`},{quoted:m});
 if(target===m.sender) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("cant kick yourself")}`},{quoted:m});

 let isTargetAdmin=meta.participants.find(p=>p.id===target)?.admin;
 if(isTargetAdmin &&!m.isOwner) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("cant kick admin, owner only")}`},{quoted:m});

 try{
  await sock.groupParticipantsUpdate(m.chat,[target],"remove");
  await sock.sendMessage(m.chat,{text:`@${target.split('@')[0]} ${toSC("was kicked out of the group successfully")}\n\n> ${toSC("powered by storm cyber md")}`, mentions:[target]});
 }catch(e){
  await sock.sendMessage(m.chat,{text:`❌ ${e.message}`},{quoted:m});
 }
}
}
