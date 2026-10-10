const fs=require('fs');
const path='./src/database/channel.json';

module.exports={
name:"channel",
aliases:["ch"],
execute: async(sock,m,args)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };

 try{
   const config = require('../../config');
   let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
   let sender=m.sender.split("@")[0]
   let isOwner = sender===botId
   let isSudo = config.SUDO? config.SUDO.includes(sender) || config.SUDO.includes(m.sender) : false
   let isSubBot = m.isSubBot || false

   if(!isOwner &&!isSudo &&!isSubBot){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text:`${toSC("quantum clearance required")}\n${toSC("owner or sudo only")}\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m})
   }

   if(!fs.existsSync('./src/database')) fs.mkdirSync('./src/database',{recursive:true});
   if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({jid:"", enabled:false}));

   let db=JSON.parse(fs.readFileSync(path));
   let q=args[0]?.toLowerCase();

   if(!q){
     return await sock.sendMessage(m.chat,{text:`${toSC("channel setup")}\n\n${toSC("usage")}:\n.channel set 1203xxx@newsletter\n.channel on\n.channel off\n.channel status\n\n${toSC("current")}: ${db.jid||toSC("not set")} | ${db.enabled?toSC("on"):toSC("off")}\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m})
   }

   if(q==="set"){
     let jid=args[1];
     if(!jid) return await sock.sendMessage(m.chat,{text:toSC("provide channel jid")},{quoted:m});
     db.jid=jid;
     fs.writeFileSync(path, JSON.stringify(db,null,2));
     return await sock.sendMessage(m.chat,{text:`${toSC("channel set to")}: ${jid}`},{quoted:m})
   }
   if(q==="on"){ db.enabled=true; fs.writeFileSync(path, JSON.stringify(db,null,2)); return await sock.sendMessage(m.chat,{text:toSC("auto forward enabled")},{quoted:m}) }
   if(q==="off"){ db.enabled=false; fs.writeFileSync(path, JSON.stringify(db,null,2)); return await sock.sendMessage(m.chat,{text:toSC("auto forward disabled")},{quoted:m}) }
   if(q==="status"){ return await sock.sendMessage(m.chat,{text:`${toSC("jid")}: ${db.jid}\n${toSC("status")}: ${db.enabled?"ON":"OFF"}`},{quoted:m}) }

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
