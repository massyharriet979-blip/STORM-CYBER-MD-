function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"add",
aliases:["invite"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"➕",key:m.key}});

 let botJid=sock.user.id.split(':')[0]+'@s.whatsapp.net';
 let isBotAdmin=meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin;
 if(!isBotAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("bot must be admin")}`},{quoted:m});

 let num=null;
 if(args[0]) num=args[0].replace(/[^0-9]/g,'');
 if(!num) return await sock.sendMessage(m.chat,{text:`${toSC("usage")}:\n.add 2567xxxxxxx\n\n> ${toSC("powered by storm x")}`},{quoted:m});

 let target=num+'@s.whatsapp.net';
 let groupName=meta.subject||"group";

 try{
  let res=await sock.groupParticipantsUpdate(m.chat,[target],"add");
  // check status
  let status=res[0]?.status;
  if(status==200 || status=="200"){
   await sock.sendMessage(m.chat,{text:`@${num} ${toSC("was successfully added to")} ${groupName} ${toSC("group")}\n\n${toSC("welcome please read the gc desc")}\n\n> ${toSC("powered by storm x")}`, mentions:[target]});
  }else if(status==403){
   await sock.sendMessage(m.chat,{text:`❌ @${num} ${toSC("privacy, cant add, sending invite link")}`, mentions:[target]});
   // send invite via wa.me message? try group invite code
   try{
    let code=await sock.groupInviteCode(m.chat);
    await sock.sendMessage(target,{text:`ɪɴᴠɪᴛᴇ ᴛᴏ ${groupName}: https://chat.whatsapp.com/${code}`});
   }catch{}
  }else{
   await sock.sendMessage(m.chat,{text:`@${num} ${toSC("was successfully added to")} ${groupName} ${toSC("group")}\n\n${toSC("welcome please read the gc desc")}\n\n> ${toSC("powered by storm x")}`, mentions:[target]});
  }
 }catch(e){
  await sock.sendMessage(m.chat,{text:`❌ ${e.message}`},{quoted:m});
 }
}
}
