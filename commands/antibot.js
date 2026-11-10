import fs from 'fs';
import path from 'path';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR='./database';
function getABFile(botId){ return path.join(DIR, `antibot_${botId}.json`); }
function loadAB(botId){
 try{
  let f=getABFile(botId);
  if(!fs.existsSync(f)) return {};
  return JSON.parse(fs.readFileSync(f));
 }catch{ return {}; }
}
function saveAB(botId,data){
 fs.mkdirSync(DIR,{recursive:true});
 fs.writeFileSync(getABFile(botId), JSON.stringify(data,null,2));
}

export default{
name:"antibot",
aliases:["ab","antibots"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});

 let meta = await sock.groupMetadata(m.chat);
 let isSenderAdmin = meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isSenderAdmin){
  return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins can use")}`},{quoted:m});
 }

 await sock.sendMessage(m.chat,{react:{text:"🤖",key:m.key}});

 let botId=m.botNumber;
 let db=loadAB(botId);
 let action=args[0]?.toLowerCase();

 if(!action){
  let status = db[m.chat]?.enabled? `✅ ${toSC("on")}` : `❌ ${toSC("off")}`;
  let txt = `╭───「 ${toSC("anti bot")} 」───\n`;
  txt += `│ ${toSC("status")}: ${status}\n`;
  txt += `│ ${toSC("mode")}: ${toSC("warn not kick")}\n`;
  txt += `╰────────────────\n\n`;
  txt += `${toSC("use")}:\n`;
  txt += `.antibot on - ${toSC("enable warning bots")}\n`;
  txt += `.antibot off - ${toSC("disable")}\n`;
  txt += `\n${toSC("when enabled, if any other bot sends commands, bot will warn using warnlimit. after limit, kick")}`;
  return await sock.sendMessage(m.chat,{text:txt},{quoted:m});
 }

 if(action==="on"){
  db[m.chat]={enabled:true};
  saveAB(botId,db);
  return await sock.sendMessage(m.chat,{text:`╭───「 ${toSC("enabled")} 」───\n│ 🤖 ${toSC("antibot enabled, will warn bots")}\n╰────────────────`},{quoted:m});
 }
 if(action==="off"){
  db[m.chat]={enabled:false};
  saveAB(botId,db);
  return await sock.sendMessage(m.chat,{text:`╭───「 ${toSC("disabled")} 」───\n│ ❌ ${toSC("antibot disabled")}\n╰────────────────`},{quoted:m});
 }
}
}
