import fs from 'fs';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"inactive",
aliases:["inactives","inactiveusers"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"📉",key:m.key}});

 let days = parseInt(args[0])||7;
 let dbFile='./src/database/admintracker.json';
 let altFile='./database/activity.json';
 let trackDb={};

 try{
  if(fs.existsSync(dbFile)) trackDb=JSON.parse(fs.readFileSync(dbFile));
  else if(fs.existsSync(altFile)) trackDb=JSON.parse(fs.readFileSync(altFile));
 }catch{}

 let cutoff=Date.now() - (days*24*60*60*1000);
 let activeIds=new Set();

 for(let chatId in trackDb){
  if(chatId!==m.chat) continue;
  for(let uid in trackDb[chatId]){
   let last=trackDb[chatId][uid]?.lastSeen || trackDb[chatId][uid]?.time || 0;
   if(last>cutoff) activeIds.add(uid);
  }
 }

 let inactive=[];
 for(let p of meta.participants){
  if(!activeIds.has(p.id) &&!p.admin){
   inactive.push(p.id);
  }
 }

 if(inactive.length===0){
  return await sock.sendMessage(m.chat,{text:`✅ ${toSC(`no inactive users in last ${days} days`)}\n\n> ${toSC("powered by storm cyber md")}`});
 }

 let txt=`${inactive.length} ${toSC(`inactive users for last ${days} days`)}\n\n`;
 let mentions=[];
 let i=1;
 for(let jid of inactive.slice(0,30)){
  mentions.push(jid);
  txt+=`${i}. @${jid.split('@')[0]}\n`;
  i++;
 }
 if(inactive.length>30) txt+=`\n+${inactive.length-30} ${toSC("more")}...`;
 txt+=`\n\n> ${toSC("powered by storm cyber md")}`;

 await sock.sendMessage(m.chat,{text:txt, mentions});
}
}
