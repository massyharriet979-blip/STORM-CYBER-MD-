function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"mute2",
aliases:["tempmute","mute5h"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required")}`},{quoted:m});
 let botId=m.botNumber || sock.user.id.split(':')[0];
 let botJid=botId+'@s.whatsapp.net';
 let isBotAdmin=meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin;
 if(!isBotAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("bot must be admin")}`});

 await sock.sendMessage(m.chat,{react:{text:"🔇",key:m.key}});

 let hours=parseInt(args[0])||5;
 let ms=hours*60*60*1000;

 try{
  await sock.groupSettingUpdate(m.chat,'announcement');
  await sock.sendMessage(m.chat,{text:`🔇 ${toSC("group muted for")} ${hours} ${toSC("hour")}${hours>1?'s':''}\n\n${toSC("will auto unmute after")} ${hours}h\n\n> ${toSC("powered by storm cyber md")}`});

  // save for railway restore
  try{
   let file=`./database/automute_${botId}.json`;
   let db={};
   if(require('fs').existsSync(file)) db=JSON.parse(require('fs').readFileSync(file));
   db[m.chat]={action:"unmute", executeAt: Date.now()+ms};
   require('fs').mkdirSync('./database',{recursive:true});
   require('fs').writeFileSync(file, JSON.stringify(db,null,2));
  }catch{}

  if(global.scheduleAutoAction) global.scheduleAutoAction(sock, botId, m.chat, "unmute", Date.now()+ms);
  if(global.saveAutoMuteSchedule) global.saveAutoMuteSchedule(botId, m.chat, "unmute", ms);

 }catch(e){
  await sock.sendMessage(m.chat,{text:`❌ ${toSC("failed to mute")}`});
 }
}
}
