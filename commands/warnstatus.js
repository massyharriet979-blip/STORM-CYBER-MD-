import fs from 'fs';

function toBoldSC(s){
 // bold not needed for small caps, using normal bold wrap
 return s;
}

export default{
name:"warnstatus",
aliases:["warns","warnings","checkwarns"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ GROUP ONLY`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ *QUANTUM CLEARANCE REQUIRED, ONLY ADMINS ARE ALLOWED TO USE THIS COMMAND*`},{quoted:m});

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
  return await sock.sendMessage(m.chat,{text:`*0 PENDINGS ARE WAITING TO BE APPROVED*\n\n*NO WARNED USERS*\n\n> *POWERED BY STORM CYBER MD*`});
 }

 let txt=`*${keys.length} WARNED USERS IN ${meta.subject}*\n\n`;
 let mentions=[];
 let i=1;
 for(let jid of keys){
  let c=groupWarns[jid]?.count||0;
  mentions.push(jid);
  txt+=`*${i}. @${jid.split('@')[0]} - ${c}/${limit} WARNS*\n`;
  i++;
 }
 txt+=`\n> *POWERED BY STORM CYBER MD*`;
 await sock.sendMessage(m.chat,{text:txt, mentions});
}
}
