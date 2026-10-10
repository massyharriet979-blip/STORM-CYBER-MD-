import fs from 'fs';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

function parseTime(str){
 if(!str) return null;
 str=str.toLowerCase().trim();
 let num=parseFloat(str);
 if(isNaN(num)) return null;
 let sec=0;
 if(str.includes('sec') || (str.includes('s') &&!str.includes('min') &&!str.includes('h'))) sec=num;
 else if(str.includes('min') || (str.includes('m') &&!str.includes('sec'))) sec=num*60;
 else if(str.includes('hour') || str.includes('hr') || str.includes('h')) sec=num*3600;
 else sec=num;
 return sec*1000;
}

export default{
name:"autounmute",
aliases:["aunmute","autoopen","autoclose2"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"🔊",key:m.key}});

 let input=args.join(" ");
 let botJid=sock.user.id.split(':')[0]+'@s.whatsapp.net';
 let isBotAdmin=meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin;
 if(!isBotAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("bot must be admin")}`},{quoted:m});

 // if no time, instantly unmute
 if(!input){
  try{
   await sock.groupSettingUpdate(m.chat,'not_announcement');
   return await sock.sendMessage(m.chat,{text:`🔊 ${toSC("group unmuted")}\n\n> ${toSC("powered by storm x")}`},{quoted:m});
  }catch(e){
   return await sock.sendMessage(m.chat,{text:`❌ ${e.message}`},{quoted:m});
  }
 }

 let ms=parseTime(input);
 if(!ms || ms<=0) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("invalid time")}\n${toSC("example")}:.autounmute 5 sec`},{quoted:m});
 if(ms > 12*3600*1000) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("max is 12 hours")}`},{quoted:m});

 let sec=Math.floor(ms/1000);
 try{
  // if group is muted, tell will unmute after
  await sock.sendMessage(m.chat,{text:`⏳ ${toSC("group will be unmuted after")} ${input}\n\n> ${toSC("powered by storm x")}`});
  setTimeout(async()=>{
   try{
    await sock.groupSettingUpdate(m.chat,'not_announcement');
    await sock.sendMessage(m.chat,{text:`🔊 ${toSC("group unmuted")}\n\n${toSC("opened after")} ${input}\n\n> ${toSC("powered by storm x")}`});
   }catch{}
  }, ms);
 }catch(e){
  await sock.sendMessage(m.chat,{text:`❌ ${e.message}`},{quoted:m});
 }
}
}
