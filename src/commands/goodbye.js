import fs from 'fs';
import path from 'path';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR='./database';
const FILE_B='goodbye.json';
function ensureDir(){ if(!fs.existsSync(DIR)) fs.mkdirSync(DIR,{recursive:true}); }
function load(file){
 ensureDir();
 let p=path.join(DIR,file);
 if(!fs.existsSync(p)) return {};
 try{ return JSON.parse(fs.readFileSync(p)); }catch{ return {}; }
}
function save(file,data){
 ensureDir();
 fs.writeFileSync(path.join(DIR,file), JSON.stringify(data,null,2));
}

const GOODBYE_IMG='https://files.catbox.moe/jtb63o.jpg';
const CHANNEL_JID='120363414065055650@newsletter';
const CHANNEL_LINK='https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P';

export default{
name:"goodbye",
aliases:["bye","setgoodbye","leave"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 let action=(args[0]||'').toLowerCase();
 let db=load(FILE_B);
 if(!db[m.chat]) db[m.chat]={enabled:false};

 if(action==='on' || action==='enable'){
  db[m.chat].enabled=true;
  save(FILE_B,db);
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
  return await sock.sendMessage(m.chat,{text:`✅ ${toSC("goodbye enabled")}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
 }
 if(action==='off' || action==='disable'){
  db[m.chat].enabled=false;
  save(FILE_B,db);
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
  return await sock.sendMessage(m.chat,{text:`❌ ${toSC("goodbye disabled")}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
 }

 let status=db[m.chat].enabled? 'ON':'OFF';
 return await sock.sendMessage(m.chat,{text:`HEY @${m.sender.split('@')[0]}\n\nGOODBYE IS ${status}\nUSE:.goodbye on / off\n\n> ${toSC("powered by storm cyber md")}`, mentions:[m.sender]});
},

handleGoodbye: async(sock, update)=>{
 try{
  let {id, participants, action} = update;
  if(action!=='remove') return;
  let db=load(FILE_B);
  if(!db[id] ||!db[id].enabled) return;

  let meta=await sock.groupMetadata(id).catch(()=>({subject:'GROUP', participants:[]}));
  let memCount=meta.participants.length;

  try{ await sock.newsletterFollow(CHANNEL_JID).catch(()=>{}); }catch{}

  for(let user of participants){
   let num=user.split('@')[0];
   let caption=`GOODBYE @${num}\n\nYOU LEFT ${meta.subject}\nIT WAS NICE HAVING YOU HERE, HOPE YOU COME BACK SOON.\n\nWE WILL MISS YOU HERE\nMEMBERS: ${memCount}\n\nFollow the STORM CYBER MD channel on WhatsApp: ${CHANNEL_LINK}\n\n> POWERED BY STORM CYBER MD`;

   await sock.sendMessage(id,{
    image:{url:GOODBYE_IMG},
    caption: caption,
    mentions:[user]
   });
  }
 }catch(e){ console.log('goodbye error', e.message); }
 }
}
