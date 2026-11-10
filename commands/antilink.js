import fs from 'fs';
import path from 'path';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}
const DIR='./database';
function getFile(b){return path.join(DIR,`antilink_${b}.json`);}
function load(b){try{if(!fs.existsSync(getFile(b))) return {}; return JSON.parse(fs.readFileSync(getFile(b)));}catch{return{};}}
function save(b,d){fs.mkdirSync(DIR,{recursive:true}); fs.writeFileSync(getFile(b),JSON.stringify(d,null,2));}

export default{
name:"antilink",
aliases:["antilinks","linkblock"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"🔗",key:m.key}});

 let botId=m.botNumber;
 let db=load(botId);
 let act=(args[0]||"").toLowerCase();
 let mode=(args[1]||args[0]||"").toLowerCase();
 // allow.antilink on warn OR.antilink warn
 if(act==="on" && args[1]) mode=args[1].toLowerCase();
 if(["warn","kick","delete","mute"].includes(act)) { mode=act; act="on"; }

 if(!act || (act==="on" &&!["warn","kick","delete","mute"].includes(mode))){
  let txt=`${toSC("usage")}\n${toSC("antilink on and your favourite mode")}\n\n${toSC("like antilink on warn")}\n\n${toSC("available modes")};\n${toSC("kick")} 💀\n${toSC("warn")} ⚠️\n${toSC("delete")} 🗑\n${toSC("mute")} 🔇\n> ${toSC("powered by storm x")}`;
  return await sock.sendMessage(m.chat,{text:txt},{quoted:m});
 }

 if(act==="on"){
  if(!["warn","kick","delete","mute"].includes(mode)) return await sock.sendMessage(m.chat,{text:`${toSC("invalid mode")}`},{quoted:m});
  db[m.chat]={enabled:true, mode:mode};
  save(botId,db);
  let reply="";
  if(mode==="warn") reply=`${toSC("antilink activated")}\n\n${toSC("mode")}: ⚠️ ${toSC("warn")} ⚠️\n${toSC("users will be warned")}\n\n> ${toSC("powered by storm x")}`;
  if(mode==="delete") reply=`${toSC("antilink activated")}\n\n${toSC("mode")}: ${toSC("delete")}\n${toSC("links will be deleted")}\n${toSC("user will be warned")}\n\n> ${toSC("powered by storm x")}`;
  if(mode==="kick") reply=`${toSC("antilink activated")}\n\n${toSC("mode")}: ${toSC("kick")}\n${toSC("a user will be instantly")}\n${toSC("kicked out of the group")}\n${toSC("no mercy for any user")}\n\n> ${toSC("powered by storm x")}`;
  if(mode==="mute") reply=`${toSC("antilink activated")}\n\n${toSC("mode")}: ${toSC("mute")}\n${toSC("your group will be automatically be unmuted for 1 max minute")}\n\n> ${toSC("powered by storm x")}`;
  return await sock.sendMessage(m.chat,{text:reply},{quoted:m});
 }
 if(act==="off"){
  db[m.chat]={enabled:false, mode:"warn"};
  save(botId,db);
  return await sock.sendMessage(m.chat,{text:`❌ ${toSC("antilink disabled")}\n\n> ${toSC("powered by storm x")}`},{quoted:m});
 }
}
}
