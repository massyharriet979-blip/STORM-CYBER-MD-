import fs from 'fs';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"warnings",
aliases:["warnlist","listwarns"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"⚠️",key:m.key}});

 let botId=m.botNumber || sock.user.id.split(':')[0];
 let warnsFile=`./database/warns_${botId}.json`;
 let wlFile=`./database/warnlimit_${botId}.json`;

 let limit=3;
 try{
  if(fs.existsSync(wlFile)){
   let l=JSON.parse(fs.readFileSync(wlFile));
   if(l[m.chat]?.limit) limit=l[m.chat].limit;
  }
 }catch{}

 let warnsDb={};
 try{ if(fs.existsSync(warnsFile)) warnsDb=JSON.parse(fs.readFileSync(warnsFile)); }catch{}

 let groupWarns=warnsDb[m.chat]||{};
 let keys=Object.keys(groupWarns);
 if(keys.length===0){
  return await sock.sendMessage(m.chat,{text:`${toSC("no warned users")}\n\n> ${toSC("powered by storm cyber md")}`});
 }

 let txt=`${keys.length} ${toSC("warned users are waiting")}\n\n`;
 let mentions=[];
 let i=1;
 for(let jid of keys){
  let c=groupWarns[jid]?.count||0;
  mentions.push(jid);
  txt+=`${i}. @${jid.split('@')[0]} - ${c}/${limit} ${toSC("warns")}\n`;
  i++;
 }
 txt+=`\n> ${toSC("powered by storm cyber md")}`;
 await sock.sendMessage(m.chat,{text:txt, mentions});
}
}
