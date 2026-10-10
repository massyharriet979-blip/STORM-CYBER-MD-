import fs from 'fs';
import path from 'path';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR = './src/database/admintracker';

export default{
name:"admintracker",
aliases:["atrack","admins","adminstat"],
execute: async(sock,m)=>{
 // === RESTRICTED: Owner / Linked / Group Admin ===
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("group only")}*`},{quoted:m});
 let groupMeta = await sock.groupMetadata(m.chat);
 let isGroupAdmin = groupMeta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isGroupAdmin){
  return await sock.sendMessage(m.chat,{text:`*⛔ ${toSC("admins or owner only")}*`},{quoted:m});
 }

 await sock.sendMessage(m.chat,{react:{text:"📊",key:m.key}});

 let file = path.join(DIR, m.chat.replace(/[^0-9@]/g,'_')+'.json');
 let data = {};
 if(fs.existsSync(file)){ try{ data = JSON.parse(fs.readFileSync(file))[m.chat] || {}; }catch{} }

 let admins = groupMeta.participants.filter(p=>p.admin);
 let totalMsgs = Object.values(data).reduce((a,b)=>a+b.msgs,0) || 1;

 let box = `╭───「 *${toSC("admin tracker")}* 」───\n`;
 box += `│ *${toSC("group")}*: ${groupMeta.subject}\n`;
 box += `│ *${toSC("total admins")}:* ${admins.length}\n`;
 box += `│ *${toSC("total tracked")}:* ${totalMsgs} ${toSC("msgs")}\n`;
 box += `╰────────────────\n\n`;

 for(let i=0;i<admins.length;i++){
  let adm = admins[i];
  let jid = adm.id;
  let info = data[jid] || {msgs:0, days:[], last:"never", media:0, chars:0, words:0, first:0};
  let daysCount = info.days?.length || 0;
  let lastSeen = info.last? new Date(info.last).toLocaleDateString() : toSC("no data");
  let avg = daysCount>0? (info.msgs/daysCount).toFixed(1) : "0";
  let actRate = ((info.msgs/totalMsgs)*100).toFixed(1);
  let isSuper = adm.admin === "superadmin"? toSC("super admin") : toSC("admin");
  let name = adm.id.split('@')[0];

  box += `╭─「 ${i+1}. @${name} 」\n`;
  box += `│ ${toSC("role")}: ${isSuper}\n`;
  box += `│ ${toSC("messages")}: ${info.msgs} ${toSC("msgs")}\n`;
  box += `│ ${toSC("days active")}: ${daysCount} ${toSC("days")}\n`;
  box += `│ ${toSC("last active")}: ${lastSeen}\n`;
  box += `│ ${toSC("media sent")}: ${info.media}\n`;
  box += `│ ${toSC("words")}: ${info.words}\n`;
  box += `│ ${toSC("chars")}: ${info.chars}\n`;
  box += `│ ${toSC("avg per day")}: ${avg}\n`;
  box += `│ ${toSC("activity")}: ${actRate}%\n`;
  box += `╰──────────────\n\n`;
 }

 if(admins.length===0) box += `${toSC("no admins found")}`;

 return await sock.sendMessage(m.chat,{
  text: box,
  mentions: admins.map(a=>a.id)
 },{quoted:m});
}
}
