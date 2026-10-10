import fs from 'fs';
import path from 'path';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR='./database';
function getWarnFile(b){return path.join(DIR,`warns_${b}.json`);}
function load(f){try{if(!fs.existsSync(f)) return {}; return JSON.parse(fs.readFileSync(f));}catch{return{};}}

export default{
name:"warnlist",
aliases:["listwarn","warns","allwarns"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"⚠️",key:m.key}});

 let botId=m.botNumber;
 let db=load(getWarnFile(botId));
 let groupWarns=db[m.chat]||{};

 let entries=Object.entries(groupWarns);
 if(entries.length===0){
  return await sock.sendMessage(m.chat,{text:`╭───⭓ ${toSC("warnlist")} ⭓───╮\n│ ✅ ${toSC("no warnings in this group")}\n╰─────────────⭓\n\n> ${toSC("powered by storm cyber md")}`});
 }

 let txt=`╭──⭓ ${toSC("warnlist")} ⭓──╮\n`;
 txt+=`│ ᴄʜᴀᴛ: ${meta.subject.slice(0,20)}\n`;
 txt+=`│ ᴛᴏᴛᴀʟ: ${entries.length} ${toSC("users warned")}\n`;
 txt+=`╰───────────────⭓\n\n`;

 let mentions=[];
 let i=1;
 for(let [jid,data] of entries){
  let count=typeof data==='number'? data : (data.count||data.warns||data.length||0);
  let num=jid.split('@')[0];
  mentions.push(jid);
  txt+=`╭──⭓ ${i}. @${num} ⭓──╮\n`;
  txt+=`│ ${toSC("warns")}: ${count}\n`;
  txt+=`│ ${toSC("number")}: ${num}\n`;
  txt+=`╰───────────────⭓\n\n`;
  i++;
 }

 txt+=`> ${toSC("powered by storm cyber md")}`;

 await sock.sendMessage(m.chat,{text:txt, mentions});
}
}
