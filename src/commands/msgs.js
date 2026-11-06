import fs from 'fs';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"msgs",
aliases:["messages","msgcount","mcount"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"💬",key:m.key}});

 let dbFile='./src/database/admintracker.json';
 let db={};
 try{ if(fs.existsSync(dbFile)) db=JSON.parse(fs.readFileSync(dbFile)); }catch{}

 let groupData=db[m.chat]||{};
 let list=Object.entries(groupData).map(([jid,info])=>({jid, count:info.count||info.messages||0})).sort((a,b)=>b.count-a.count);

 if(list.length===0){
  return await sock.sendMessage(m.chat,{text:`${toSC("no message data yet")}\n\n> ${toSC("powered by storm cyber md")}`});
 }

 let targetJid=m.mentionedJid[0] || (m.quoted? m.quoted.sender: null);
 if(targetJid){
  let found=list.find(x=>x.jid===targetJid);
  let cnt=found? found.count:0;
  return await sock.sendMessage(m.chat,{text:`@${targetJid.split('@')[0]} ${toSC("has")} ${cnt} ${toSC("messages")}\n\n> ${toSC("powered by storm cyber md")}`, mentions:[targetJid]});
 }

 let txt=`${toSC("top message senders in")} ${meta.subject}\n\n`;
 let mentions=[];
 let top=list.slice(0,15);
 let i=1;
 for(let u of top){
  mentions.push(u.jid);
  txt+=`${i}. @${u.jid.split('@')[0]} - ${u.count} ${toSC("msgs")}\n`;
  i++;
 }
 txt+=`\n> ${toSC("powered by storm cyber md")}`;
 await sock.sendMessage(m.chat,{text:txt, mentions});
}
}
