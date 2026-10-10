import fs from 'fs';
import path from 'path';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR='./database';
function getWarnFile(b){return path.join(DIR,`warns_${b}.json`);}
function load(f){try{if(!fs.existsSync(f)) return {}; return JSON.parse(fs.readFileSync(f));}catch{return{};}}
function save(f,d){fs.mkdirSync(DIR,{recursive:true}); fs.writeFileSync(f,JSON.stringify(d,null,2));}

export default{
name:"resetwarn",
aliases:["clearwarn","delwarn","unwarn"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"♻️",key:m.key}});

 let botId=m.botNumber;
 let target=null;
 if(m.quoted) target=m.quoted.sender;
 else if(m.mentionedJid && m.mentionedJid[0]) target=m.mentionedJid[0];
 else if(args[0]){
  let num=args[0].replace(/[^0-9]/g,'');
  if(num) target=num+'@s.whatsapp.net';
 }

 if(!target) return await sock.sendMessage(m.chat,{text:`${toSC("usage")}:\n.resetwarn @user\n${toSC("or reply")}\n\n> ${toSC("powered by storm x")}`},{quoted:m});

 let db=load(getWarnFile(botId));
 if(!db[m.chat] ||!db[m.chat][target]){
  return await sock.sendMessage(m.chat,{text:`⚠️ @${target.split('@')[0]} ${toSC("has no warnings")}`, mentions:[target]});
 }

 delete db[m.chat][target];
 save(getWarnFile(botId), db);

 await sock.sendMessage(m.chat,{text:`@${target.split('@')[0]} ${toSC("all warnings of")} @${target.split('@')[0]} ${toSC("were all removed")}\n\n> ${toSC("powered by storm x")}`, mentions:[target]});
}
}
