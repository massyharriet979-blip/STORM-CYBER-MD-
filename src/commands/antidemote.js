import fs from 'fs';
import path from 'path';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR='./database';
function getFile(b){return path.join(DIR,`antidemote_${b}.json`);}
function load(b){try{if(!fs.existsSync(getFile(b))) return {}; return JSON.parse(fs.readFileSync(getFile(b)));}catch{return{};}}
function save(b,d){fs.mkdirSync(DIR,{recursive:true}); fs.writeFileSync(getFile(b),JSON.stringify(d,null,2));}

export default{
name:"antidemote",
aliases:["antidemo","nodemote"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"🔒",key:m.key}});

 let botId=m.botNumber;
 let db=load(botId);
 let act=(args[0]||"").toLowerCase();

 if(!act ||!["on","off","enable","disable"].includes(act)){
  let status=db[m.chat]?.enabled?"ᴏɴ":"ᴏғғ";
  return await sock.sendMessage(m.chat,{text:`${toSC("usage")}:\n.antidemote on\n.antidemote off\n\n${toSC("current")}: ${status}\n\n${toSC("when on, any admin demotion will be auto promoted back")}\n\n> ${toSC("powered by storm x")}`},{quoted:m});
 }

 if(act==="on" || act==="enable"){
  db[m.chat]={enabled:true};
  save(botId,db);
  return await sock.sendMessage(m.chat,{text:`✅ ${toSC("antidemote activated")}\n\n${toSC("any user demoted will be auto promoted back")}\n\n> ${toSC("powered by storm x")}`},{quoted:m});
 }else{
  db[m.chat]={enabled:false};
  save(botId,db);
  return await sock.sendMessage(m.chat,{text:`❌ ${toSC("antidemote disabled")}\n\n> ${toSC("powered by storm x")}`},{quoted:m});
 }
}
}
