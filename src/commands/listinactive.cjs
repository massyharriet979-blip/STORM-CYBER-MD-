import fs from 'fs';
import path from 'path';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR = './src/database/admintracker';

export default{
name:"listinactive",
aliases:["inactive","ghost","noreply"],
execute: async(sock,m)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});

 let meta = await sock.groupMetadata(m.chat);
 let isSenderAdmin = meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isSenderAdmin){
  return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("admins or owner only")}`},{quoted:m});
 }

 await sock.sendMessage(m.chat,{react:{text:"👻",key:m.key}});

 let file = path.join(DIR, m.chat.replace(/[^0-9@]/g,'_')+'.json');
 let tracked = {};
 if(fs.existsSync(file)){
  try{ tracked = JSON.parse(fs.readFileSync(file))[m.chat] || {}; }catch{ tracked={}; }
 }

 let inactive = [];
 let activeCount = 0;

 for(let p of meta.participants){
  let jid = p.id;
  let data = tracked[jid];
  if(!data || data.msgs===0){
   inactive.push(jid);
  }else{
   activeCount++;
  }
 }

 let box = `╭───「 *${toSC("inactive check")}* 」───\n`;
 box += `│ ${toSC("group")}: ${meta.subject}\n`;
 box += `│ ${toSC("total")}: ${meta.participants.length}\n`;
 box += `│ ${toSC("active")}: ${activeCount}\n`;
 box += `│ ${toSC("inactive")}: ${inactive.length}\n`;
 box += `╰────────────────\n\n`;

 if(inactive.length===0){
  box += `✅ ${toSC("everyone is active, no ghost")}\n`;
  return await sock.sendMessage(m.chat,{text:box},{quoted:m});
 }

 box += `*${toSC("never sent message")}:*\n\n`;
 inactive.forEach((jid,i)=>{
  box += `${i+1}. @${jid.split('@')[0]} - 0 ${toSC("msg")}\n`;
 });

 box += `\n> ${toSC("use")}.kickinactive ${toSC("to remove them")}`;

 return await sock.sendMessage(m.chat,{
  text: box,
  mentions: inactive
 },{quoted:m});
}
}
