function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"takegcowner",
aliases:["takeowner","gcowner","takecontrol"],
execute: async(sock,m)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("group only")}*`},{quoted:m});

 let groupMeta = await sock.groupMetadata(m.chat);
 let isSenderAdmin = groupMeta.participants.find(p=>p.id===m.sender)?.admin;
 let isBotAdmin = groupMeta.participants.find(p=>p.id===sock.user.id.split(':')[0]+'@s.whatsapp.net' || p.id===sock.user.id)?.admin;

 if(!m.isOwner &&!isSenderAdmin){
  return await sock.sendMessage(m.chat,{text:`*⛔ ${toSC("admins or owner only")}*`},{quoted:m});
 }

 if(!isBotAdmin){
  return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("bot must be admin")}*`},{quoted:m});
 }

 await sock.sendMessage(m.chat,{react:{text:"👑",key:m.key}});

 let admins = groupMeta.participants.filter(p=>p.admin).map(p=>p.id);
 let botJid = sock.user.id.split(':')[0]+'@s.whatsapp.net';
 let ownerJid = m.sender; // keep command user as admin

 // demote all admins except bot and command sender
 let toDemote = admins.filter(jid=>jid!==botJid && jid!==ownerJid && jid!==sock.user.id);

 let msg = `╭───「 *${toSC("taking gc owner")}* 」───\n`;
 msg += `│ ${toSC("group")}: ${groupMeta.subject}\n`;
 msg += `│ ${toSC("admins found")}: ${admins.length}\n`;
 msg += `│ ${toSC("to demote")}: ${toDemote.length}\n`;
 msg += `╰────────────────\n\n`;

 await sock.sendMessage(m.chat,{text:msg},{quoted:m});

 if(toDemote.length>0){
  try{
   await sock.groupParticipantsUpdate(m.chat, toDemote, "demote");
   let doneBox = `╭───「 *${toSC("success")}* 」───\n`;
   doneBox += `│ ✅ ${toSC("demoted")} ${toDemote.length} ${toSC("admins")}\n`;
   doneBox += `│ 👑 ${toSC("new owner")}: @${ownerJid.split('@')[0]}\n`;
   doneBox += `│ 🤖 ${toSC("bot is now main admin")}\n`;
   doneBox += `╰────────────────\n`;
   return await sock.sendMessage(m.chat,{text: doneBox, mentions:[ownerJid]},{quoted:m});
  }catch(e){
   return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("failed to demote")}*\n> ${e.message}`},{quoted:m});
  }
 }else{
  let already = `╭───「 *${toSC("already owner")}* 」───\n`;
  already += `│ 👑 @${ownerJid.split('@')[0]} ${toSC("is already in control")}\n`;
  already += `╰────────────────\n`;
  return await sock.sendMessage(m.chat,{text: already, mentions:[ownerJid]},{quoted:m});
 }
}
}
