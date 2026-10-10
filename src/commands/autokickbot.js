import fs from 'fs';
import path from 'path';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR = './database';
function getFile(botId){ return path.join(DIR, `autokickbot_${botId}.json`); }
function load(botId){
 try{
  let f=getFile(botId);
  if(!fs.existsSync(f)) return {};
  return JSON.parse(fs.readFileSync(f));
 }catch{ return {}; }
}
function save(botId, data){
 fs.mkdirSync(DIR,{recursive:true});
 fs.writeFileSync(getFile(botId), JSON.stringify(data,null,2));
}

function isBotJid(jid){
 // detect bot numbers: often pushName contains bot or jid is known subbot
 // we treat any number that is not human as bot if it has high activity with prefix
 // simple detection: if jid includes "bot" or is in subbots list
 let id = jid.toLowerCase();
 if(id.includes('bot')) return true;
 try{
  if(global.subbots && global.subbots.has(jid.split('@')[0])) return true;
 }catch{}
 return false;
}

export default{
name:"autokickbot",
aliases:["akb","kickbot","antibot"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("group only")}*`},{quoted:m});

 let groupMeta = await sock.groupMetadata(m.chat);
 let isSenderAdmin = groupMeta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isSenderAdmin){
  return await sock.sendMessage(m.chat,{text:`*⛔ ${toSC("admins or owner only")}*`},{quoted:m});
 }

 let isBotAdmin = groupMeta.participants.find(p=>p.id===sock.user.id.split(':')[0]+'@s.whatsapp.net' || p.id.includes(sock.user.id.split(':')[0]))?.admin;
 if(!isBotAdmin) return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("bot must be admin")}*`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"🤖",key:m.key}});

 let botId = m.botNumber;
 let data = load(botId);
 let action = args[0]?.toLowerCase();

 if(!action){
  let status = data[m.chat]?.enabled? `✅ ${toSC("on")}` : `❌ ${toSC("off")}`;
  let box = `╭───「 *${toSC("auto kick bot")}* 」───\n`;
  box += `│ *${toSC("status")}*: ${status}\n`;
  box += `│ *${toSC("group")}*: ${groupMeta.subject}\n`;
  box += `╰────────────────\n\n`;
  box += `${toSC("commands")}:\n`;
  box += `.autokickbot on - ${toSC("enable")}\n`;
  box += `.autokickbot off - ${toSC("disable")}\n`;
  box += `.autokickbot kick - ${toSC("kick all bots now")}\n`;

  return await sock.sendMessage(m.chat,{
   text: box,
   footer: toSC("storm anti bot"),
   buttons:[
    {buttonId:`.autokickbot ${data[m.chat]?.enabled? 'off' : 'on'}`, buttonText:{displayText:`${data[m.chat]?.enabled? `❌ ${toSC("off")}` : `✅ ${toSC("on")}`}`}, type:1},
    {buttonId:`.autokickbot kick`, buttonText:{displayText:`🦶 ${toSC("kick now")}`}, type:1},
   ],
   headerType:1
  },{quoted:m});
 }

 if(action==="on" || action==="enable"){
  if(!data[m.chat]) data[m.chat]={enabled:true};
  else data[m.chat].enabled=true;
  save(botId,data);
  let b = `╭───「 *${toSC("enabled")}* 」───\n│ ✅ ${toSC("auto kick bot enabled")}\n╰────────────────\n`;
  return await sock.sendMessage(m.chat,{text:b},{quoted:m});
 }

 if(action==="off" || action==="disable"){
  if(!data[m.chat]) data[m.chat]={enabled:false};
  else data[m.chat].enabled=false;
  save(botId,data);
  let b = `╭───「 *${toSC("disabled")}* 」───\n│ ❌ ${toSC("auto kick bot disabled")}\n╰────────────────\n`;
  return await sock.sendMessage(m.chat,{text:b},{quoted:m});
 }

 if(action==="kick" || action==="purge" || action==="now"){
  let participants = groupMeta.participants;
  let botsToKick = participants.filter(p=>{
   let jid=p.id;
   let botJid=sock.user.id.split(':')[0]+'@s.whatsapp.net';
   if(jid===botJid) return false;
   if(jid===m.sender) return false;
   return isBotJid(jid);
  }).map(p=>p.id);

  // also kick if pushName has bot keyword - we can't get pushName from metadata, so we kick detected only
  // fallback: if no bot detected via id, list all and let owner choose - but we will kick none and inform

  if(botsToKick.length===0){
   // try second method: kick any participant that is a subbot number
   try{
    let subIds = Array.from(global.subbots.keys()).map(n=>n+'@s.whatsapp.net');
    botsToKick = participants.filter(p=>subIds.includes(p.id)).map(p=>p.id);
   }catch{}
  }

  if(botsToKick.length===0){
   return await sock.sendMessage(m.chat,{text:`╭───「 *${toSC("scan")}* 」───\n│ ${toSC("no bots found")}\n╰────────────────\n`},{quoted:m});
  }

  try{
   await sock.groupParticipantsUpdate(m.chat, botsToKick, "remove");
   let b = `╭───「 *${toSC("kicked")}* 」───\n`;
   b += `│ 🦶 ${toSC("kicked")} ${botsToKick.length} ${toSC("bots")}\n`;
   b += `│ ${botsToKick.map(j=>`@${j.split('@')[0]}`).join(', ')}\n`;
   b += `╰────────────────\n`;
   return await sock.sendMessage(m.chat,{text:b, mentions:botsToKick},{quoted:m});
  }catch(e){
   return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("failed")}* ${e.message}`},{quoted:m});
  }
 }
}
}
