import fs from 'fs';
import path from 'path';

function toMathBold(s){
 const map={
  a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
  A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
  0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵'
 };
 return s.split('').map(c=>map[c]||c).join('');
}

const DIR='./database';
function getFile(botId){ return path.join(DIR, `warnlimit_${botId}.json`); }
function load(botId){
 try{
  let f=getFile(botId);
  if(!fs.existsSync(f)) return {};
  return JSON.parse(fs.readFileSync(f));
 }catch{ return {}; }
}
function save(botId,data){
 fs.mkdirSync(DIR,{recursive:true});
 fs.writeFileSync(getFile(botId), JSON.stringify(data,null,2));
}

export default{
name:"warnlimit",
aliases:["setwarn","setwarnlimit","warnconfig"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toMathBold("group only")}`},{quoted:m});

 let meta = await sock.groupMetadata(m.chat);
 let isAdmin = meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin){
  return await sock.sendMessage(m.chat,{text:`⛔ ${toMathBold("quantum clearance required, only admins can use this command")}`},{quoted:m});
 }

 await sock.sendMessage(m.chat,{react:{text:"⚠️",key:m.key}});

 let botId=m.botNumber;
 let db=load(botId);
 let current=db[m.chat]?.limit || 3;

 let input=args[0]?.toLowerCase();

 if(!input){
  let txt=`${toMathBold("warn limit controller")}\n\n`;
  txt+=`${toMathBold("group")}: ${meta.subject}\n`;
  txt+=`${toMathBold("current limit")}: ${current} ${toMathBold("warns")}\n\n`;
  txt+=`${toMathBold("how it works")}:\n`;
  txt+=`${toMathBold("if limit is 3, member will be kicked after 3 warns")}\n`;
  txt+=`${toMathBold("if you set to 5, needs 5 warns to kick")}\n`;
  txt+=`${toMathBold("after limit reached, warnings reset and user is removed")}\n\n`;
  txt+=`${toMathBold("commands")}:\n`;
  txt+=`.warnlimit 3 ${toMathBold("set limit to 3")}\n`;
  txt+=`.warnlimit 5 ${toMathBold("set limit to 5")}\n`;
  txt+=`.warnlimit reset ${toMathBold("reset to default")}\n\n`;
  txt+=`${toMathBold("linked warn commands")}:\n`;
  txt+=`${toMathBold("warn, delwarn, warnings, resetwarn")}\n`;
  txt+=`${toMathBold("they all use this limit")}`;
  return await sock.sendMessage(m.chat,{text:txt},{quoted:m});
 }

 if(input==="reset" || input==="default"){
  db[m.chat]={limit:3};
  save(botId,db);
  return await sock.sendMessage(m.chat,{text:`${toMathBold("warn limit reset to 3")}`},{quoted:m});
 }

 let num=parseInt(input);
 if(isNaN(num) || num<1 || num>20){
  return await sock.sendMessage(m.chat,{text:`❌ ${toMathBold("enter number 1-20, ex:.warnlimit 3")}`},{quoted:m});
 }

 db[m.chat]={limit:num};
 save(botId,db);

 let txt=`${toMathBold("warn limit updated")}\n\n`;
 txt+=`${toMathBold("old limit")}: ${current}\n`;
 txt+=`${toMathBold("new limit")}: ${num}\n\n`;
 txt+=`${toMathBold("now members will be removed after")} ${num} ${toMathBold("warnings")}\n`;
 txt+=`${toMathBold("quantum clearance active")}`;

 return await sock.sendMessage(m.chat,{text:txt},{quoted:m});
}
}
