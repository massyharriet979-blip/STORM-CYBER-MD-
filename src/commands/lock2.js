const fs=require('fs');
const path=require('path');
const { translateText } = require('../lib/translate');
const dbPath=path.join(__dirname,'../database/lock2.json');

function getDB(){
 if(!fs.existsSync(dbPath)){ fs.mkdirSync(path.dirname(dbPath),{recursive:true}); fs.writeFileSync(dbPath,JSON.stringify([])); }
 try{ return JSON.parse(fs.readFileSync(dbPath)); }catch{ return []; }
}
function saveDB(data){ fs.mkdirSync(path.dirname(dbPath),{recursive:true}); fs.writeFileSync(dbPath,JSON.stringify(data,null,2)); }

module.exports={
name:"lock2",
aliases:["hardlock","antilink2","lockall"],
execute: async(sock,m,args)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   if(!m.chat.endsWith("@g.us")){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("group only command")}`)},{quoted:m});
   }

   const config=require('../../config');
   let sender=m.sender.split("@")[0];
   let isOwner=sender===botNum.split("@")[0];
   let isSudo=config.SUDO?config.SUDO.includes(sender):false;

   let metadata=await sock.groupMetadata(m.chat);
   let isSenderAdmin=metadata.participants.find(p=>p.id===m.sender)?.admin!=null;

   if(!isSenderAdmin &&!isOwner &&!isSudo){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("admin only")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   let botParticipant=metadata.participants.find(p=>p.id.split("@")[0]===botNum || p.id===sock.user.id);
   if(botParticipant?.admin==null){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("i must be admin to use lock2")}`)},{quoted:m});
   }

   let db=getDB();
   let action=(args[0]||"").toLowerCase();
   let isOn=db.includes(m.chat);

   if(action==="on" || action==="enable"){
     if(isOn) return await sock.sendMessage(m.chat,{text: await t(`${toSC("lock2 already enabled")}`)},{quoted:m});
     db.push(m.chat); saveDB(db);
     await sock.sendMessage(m.chat,{react:{text:"🔒",key:m.key}});
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("lock2 enabled")}\n${toSC("all messages will be deleted even from admins")}\n${toSC("only bot will survive")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   if(action==="off" || action==="disable"){
     if(!isOn) return await sock.sendMessage(m.chat,{text: await t(`${toSC("lock2 already disabled")}`)},{quoted:m});
     db=db.filter(id=>id!==m.chat); saveDB(db);
     await sock.sendMessage(m.chat,{react:{text:"🔓",key:m.key}});
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("lock2 disabled")}\n${toSC("group unlocked")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   // toggle info
   let status=isOn?toSC("enabled"):toSC("disabled");
   return await sock.sendMessage(m.chat,{text: await t(`${toSC("lock2 status")}: ${status}\n${toSC("usage")}:.lock2 on /.lock2 off\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
