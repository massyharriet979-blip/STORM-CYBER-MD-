import fs from 'fs';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"common",
aliases:["commons","commongroups","commonusers"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"🔗",key:m.key}});

 let targetJid=m.mentionedJid[0] || (m.quoted? m.quoted.sender: null);

 // MODE 1:.common @user -> show groups in common with that user (bot groups)
 if(targetJid){
  try{
   let all=await sock.groupFetchAllParticipating();
   let commonGroups=[];
   for(let gid in all){
    if(all[gid].participants.find(p=>p.id===targetJid)) commonGroups.push(all[gid]);
   }
   if(commonGroups.length===0){
    return await sock.sendMessage(m.chat,{text:`${toSC("no common groups with")} @${targetJid.split('@')[0]}\n\n> ${toSC("powered by storm cyber md")}`, mentions:[targetJid]});
   }
   let txt=`${commonGroups.length} ${toSC("common groups with")} @${targetJid.split('@')[0]}\n\n`;
   let i=1;
   for(let g of commonGroups.slice(0,20)){
    txt+=`${i}. ${g.subject} - ${g.participants.length} ${toSC("members")}\n`;
    i++;
   }
   if(commonGroups.length>20) txt+=`\n+${commonGroups.length-20} ${toSC("more")}...`;
   txt+=`\n\n> ${toSC("powered by storm cyber md")}`;
   return await sock.sendMessage(m.chat,{text:txt, mentions:[targetJid]});
  }catch(e){
   return await sock.sendMessage(m.chat,{text:`${toSC("failed to fetch")}`});
  }
 }

 // MODE 2:.common <group link/id> -> compare members
 let otherId=args[0];
 if(otherId && (otherId.includes('@g.us') || otherId.length>15)){
  try{
   let otherMeta=await sock.groupMetadata(otherId.includes('@g.us')? otherId: otherId+'@g.us');
   let common=meta.participants.filter(p=> otherMeta.participants.find(o=>o.id===p.id));
   let mentions=common.map(c=>c.id);
   let txt=`${toSC("common members between")}\n${meta.subject} & ${otherMeta.subject}\n\n${common.length} ${toSC("common users")}\n\n`;
   let i=1;
   for(let u of common.slice(0,30)){
    txt+=`${i}. @${u.id.split('@')[0]}\n`;
    i++;
   }
   if(common.length>30) txt+=`\n+${common.length-30} ${toSC("more")}...`;
   txt+=`\n\n> ${toSC("powered by storm cyber md")}`;
   return await sock.sendMessage(m.chat,{text:txt, mentions});
  }catch{
   return await sock.sendMessage(m.chat,{text:`${toSC("invalid group id")}`});
  }
 }

 // MODE 3: default -> show common members stats for current group vs all groups
 try{
  let all=await sock.groupFetchAllParticipating();
  let gids=Object.keys(all);
  let txt=`${toSC("you are in")} ${gids.length} ${toSC("groups")}\n${toSC("current")}: ${meta.subject} - ${meta.participants.length} ${toSC("members")}\n\n${toSC("use")}:.common @user - ${toSC("check common groups")}\n.common <groupId> - ${toSC("compare members")}\n\n> ${toSC("powered by storm cyber md")}`;
  await sock.sendMessage(m.chat,{text:txt});
 }catch{
  await sock.sendMessage(m.chat,{text:`${toSC("failed")}`});
 }
}
}
