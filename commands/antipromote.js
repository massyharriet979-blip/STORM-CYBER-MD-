import fs from 'fs';
import path from 'path';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR='./database';
function getFile(botId){ return path.join(DIR, `antipromote_${botId}.json`); }
function load(botId){
 try{ if(!fs.existsSync(getFile(botId))) return {}; return JSON.parse(fs.readFileSync(getFile(botId))); }catch{ return {}; }
}
function save(botId,data){ fs.mkdirSync(DIR,{recursive:true}); fs.writeFileSync(getFile(botId), JSON.stringify(data,null,2)); }

export default{
name:"antipromote",
aliases:["antiprom","no_promote"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});

 let meta = await sock.groupMetadata(m.chat);
 let isAdmin = meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin){
  return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});
 }

 await sock.sendMessage(m.chat,{react:{text:"👮",key:m.key}});

 let botId=m.botNumber;
 let db=load(botId);
 let act=args[0]?.toLowerCase();

 if(!act){
  let st=db[m.chat]?.enabled? `${toSC("on")}` : `${toSC("off")}`;
  return await sock.sendMessage(m.chat,{text:`${toSC("antipromote status")}: ${st}\n\n${toSC("use")}:\n.antipromote on\n.antipromote off\n\n${toSC("when on, if anyone promotes someone, bot will auto demote them")}`},{quoted:m});
 }

 if(act==="on"){
  db[m.chat]={enabled:true};
  save(botId,db);
  return await sock.sendMessage(m.chat,{text:`✅ ${toSC("antipromote enabled")}`},{quoted:m});
 }
 if(act==="off"){
  db[m.chat]={enabled:false};
  save(botId,db);
  return await sock.sendMessage(m.chat,{text:`❌ ${toSC("antipromote disabled")}`},{quoted:m});
 }
}
}
