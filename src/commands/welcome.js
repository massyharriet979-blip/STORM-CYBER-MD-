import fs from 'fs';
import path from 'path';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR='./database';
const FILE_W='welcome.json';
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

const WELCOME_IMG='https://files.catbox.moe/jtb63o.jpg';
const CHANNEL_JID='120363414065055650@newsletter';
const CHANNEL_LINK='https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P';

export default{
name:"welcome",
aliases:["wel","setwelcome"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 let action=(args[0]||'').toLowerCase();
 let db=load(FILE_W);
 if(!db[m.chat]) db[m.chat]={enabled:false};

 if(action==='on' || action==='enable'){
  db[m.chat].enabled=true;
  save(FILE_W,db);
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
  return await sock.sendMessage(m.chat,{text:`✅ ${toSC("welcome enabled")}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
 }
 if(action==='off' || action==='disable'){
  db[m.chat].enabled=false;
  save(FILE_W,db);
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
  return await sock.sendMessage(m.chat,{text:`❌ ${toSC("welcome disabled")}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
 }

 // status
 let status=db[m.chat].enabled? 'ON':'OFF';
 return await sock.sendMessage(m.chat,{text:`HEY @${m.sender.split('@')[0]}\n\nWELCOME IS ${status}\nUSE:.welcome on / off\n\n> ${toSC("powered by storm cyber md")}`, mentions:[m.sender]});
},

// Call this from your groupParticipantsUpdate event
handleWelcome: async(sock, update)=>{
 try{
  let {id, participants, action} = update;
  if(action!=='add') return;
  let db=load(FILE_W);
  if(!db[id] ||!db[id].enabled) return;

  let meta=await sock.groupMetadata(id);
  let memCount=meta.participants.length;
  let adminCount=meta.participants.filter(p=>p.admin).length;

  // try view channel to boost
  try{ await sock.newsletterFollow(CHANNEL_JID).catch(()=>{}); }catch{}

  for(let user of participants){
   let num=user.split('@')[0];
   let caption=`HEY @${num}\n\nWELCOME TO ${meta.subject}\nYOU'RE GONNA HAVE A GREAT TIME HERE, STAY ACTIVE AND VIBE WITH US.\n\nWE ARE HAPPY TO HAVE YOU HERE\nMEMBERS: ${memCount}\nADMINS: ${adminCount}\n\nFollow the STORM CYBER MD channel on WhatsApp: ${CHANNEL_LINK}\n\n> POWERED BY STORM CYBER MD`;

   await sock.sendMessage(id,{
    image:{url:WELCOME_IMG},
    caption: caption,
    mentions:[user]
   });
  }
 }catch(e){ console.log('welcome error', e.message); }
 }
}
