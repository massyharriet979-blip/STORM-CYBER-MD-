import fs from 'fs';
import path from 'path';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR='./database';
function getFile(botId){ return path.join(DIR, `antigroupmention_${botId}.json`); }
function load(botId){
 try{ if(!fs.existsSync(getFile(botId))) return {}; return JSON.parse(fs.readFileSync(getFile(botId))); }catch{ return {}; }
}
function save(botId,data){ fs.mkdirSync(DIR,{recursive:true}); fs.writeFileSync(getFile(botId), JSON.stringify(data,null,2)); }

export default{
name:"antigroupmention",
aliases:["antigm","antigmentioned","antigroupmentioned"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});

 let meta = await sock.groupMetadata(m.chat);
 let isAdmin = meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin){
  return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("only admins can use")}\n\n> powered by storm cyber md`},{quoted:m});
 }

 await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}});

 let botId=m.botNumber;
 let db=load(botId);
 let act=args[0]?.toLowerCase();

 if(!act){
  let st=db[m.chat]?.enabled? `✅ ${toSC("on")}` : `❌ ${toSC("off")}`;
  let txt=`╭───「 ${toSC("anti group mention")} 」───\n`;
  txt+=`│ ${toSC("status")}: ${st}\n`;
  txt+=`╰────────────────\n\n`;
  txt+=`${toSC("use")}:\n`;
  txt+=`.antigroupmention on - ${toSC("enable")}\n`;
  txt+=`.antigroupmention off - ${toSC("disable")}\n\n`;
  txt+=`> ${toSC("powered by storm cyber md")}`;
  return await sock.sendMessage(m.chat,{text:txt},{quoted:m});
 }

 if(act==="on"){
  db[m.chat]={enabled:true};
  save(botId,db);
  return await sock.sendMessage(m.chat,{text:`✅ ${toSC("antigroupmention enabled")}\n\n> powered by storm cyber md`},{quoted:m});
 }
 if(act==="off"){
  db[m.chat]={enabled:false};
  save(botId,db);
  return await sock.sendMessage(m.chat,{text:`❌ ${toSC("antigroupmention disabled")}\n\n> powered by storm cyber md`},{quoted:m});
 }
}
}
