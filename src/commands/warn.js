import fs from 'fs';
import path from 'path';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR='./database';
function getLimitFile(b){return path.join(DIR,`warnlimit_${b}.json`);}
function getWarnFile(b){return path.join(DIR,`warns_${b}.json`);}
function load(f){try{if(!fs.existsSync(f)) return {}; return JSON.parse(fs.readFileSync(f));}catch{return{};}}
function save(f,d){fs.mkdirSync(DIR,{recursive:true}); fs.writeFileSync(f,JSON.stringify(d,null,2));}

export default{
name:"warn",
aliases:["warning"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"⚠️",key:m.key}});

 let botId=m.botNumber;
 let target=null;
 if(m.quoted) target=m.quoted.sender;
 else if(m.mentionedJid && m.mentionedJid[0]) target=m.mentionedJid[0];
 else if(args[0]) {
  let num=args[0].replace(/[^0-9]/g,'');
  if(num) target=num+'@s.whatsapp.net';
 }

 if(!target) return await sock.sendMessage(m.chat,{text:`${toSC("usage")}:\n.warn @user\n${toSC("or reply to user")}\n\n> ${toSC("powered by storm x")}`},{quoted:m});

 let botJid=sock.user.id.split(':')[0]+'@s.whatsapp.net';
 if(target===botJid || target===sock.user.id) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("cant warn bot")}`},{quoted:m});
 let isTargetAdmin=meta.participants.find(p=>p.id===target)?.admin;
 if(isTargetAdmin) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("cant warn admin")}`},{quoted:m});

 // get limit
 let limit=3;
 let limitDb=load(getLimitFile(botId));
 if(limitDb[m.chat]?.limit) limit=limitDb[m.chat].limit;

 let warnsDb=load(getWarnFile(botId));
 if(!warnsDb[m.chat]) warnsDb[m.chat]={};
 if(!warnsDb[m.chat][target]) warnsDb[m.chat][target]={count:0};
 warnsDb[m.chat][target].count+=1;
 let count=warnsDb[m.chat][target].count;
 save(getWarnFile(botId), warnsDb);

 if(count < limit){
  await sock.sendMessage(m.chat,{text:`@${target.split('@')[0]} ${toSC("has been")} ⚠️ ${toSC("warned")} ${count}/${limit}\n\n> ${toSC("powered by storm x")}`, mentions:[target]});
 }else{
  await sock.sendMessage(m.chat,{text:`@${target.split('@')[0]} ${toSC("has been")} ⚠️ ${toSC("warned")} ${count}/${limit}\n${toSC("limit reached, kicking")}\n\n> ${toSC("powered by storm x")}`, mentions:[target]});
  await new Promise(r=>setTimeout(r,1500));
  try{ await sock.groupParticipantsUpdate(m.chat,[target],"remove"); }catch{}
  delete warnsDb[m.chat][target];
  save(getWarnFile(botId), warnsDb);
  await sock.sendMessage(m.chat,{text:`@${target.split('@')[0]} ${toSC("was kicked for reaching warn limit")}\n> ${toSC("powered by storm x")}`, mentions:[target]}).catch(()=>{});
 }
}
}
