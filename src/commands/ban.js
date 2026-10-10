const fs=require('fs');
const path='./src/database/banned.json';
const { translateText } = require('../lib/translate');

module.exports={
name:"ban",
aliases:["block","banuser","blacklist"],
execute: async(sock,m,args)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   const config=require('../../config');
   let botNum=sock.user?.id?.split(":")[0]||"";
   let botId=botNum.split("@")[0];
   let sender=m.sender.split("@")[0];
   let isOwner=sender===botId;
   let isSudo=config.SUDO?config.SUDO.includes(sender)||config.SUDO.includes(m.sender):false;
   let isSubBot=m.isSubBot||false;
   let t=async(txt)=>await translateText(txt,botNum);

   if(!isOwner &&!isSudo &&!isSubBot){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("quantum clearance required")}\n${toSC("owner or sudo only")}`)},{quoted:m});
   }

   if(!fs.existsSync('./src/database')) fs.mkdirSync('./src/database',{recursive:true});
   if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([],null,2));
   let db=JSON.parse(fs.readFileSync(path));

   let sub=(args[0]||"").toLowerCase();

   // LIST
   if(sub==="list"||sub==="all"){
     if(db.length===0) return await sock.sendMessage(m.chat,{text: await t(`${toSC("no banned users")}\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
     let txt=`${toSC("banned users")} - ${db.length}\n\n`+db.map((x,i)=>`${i+1}. ${x.jid.split("@")[0]} - ${new Date(x.date).toLocaleDateString()} - ${x.reason||"no reason"}`).join("\n");
     txt+=`\n\n${toSC("unban")}:.unban @user\n> ${toSC("powered by storm")} 𝐗`;
     return await sock.sendMessage(m.chat,{text: await t(txt)},{quoted:m});
   }

   // GET TARGET
   let target=null;
   if(m.quoted) target=m.quoted.sender;
   else if(m.mentionedJid && m.mentionedJid[0]) target=m.mentionedJid[0];
   else if(args[0] && args[0].includes("@")) target=args[0].replace("@","")+"@s.whatsapp.net";
   else if(args[0] && /^\d+$/.test(args[0])) target=args[0]+"@s.whatsapp.net";

   if(!target) return await sock.sendMessage(m.chat,{text: await t(`${toSC("usage")}:.ban @user / reply\n.ban list\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

   if(target.split("@")[0]===botId) return await sock.sendMessage(m.chat,{text: await t(`${toSC("cannot ban bot")}`)},{quoted:m});
   if(config.SUDO && config.SUDO.includes(target.split("@")[0])) return await sock.sendMessage(m.chat,{text: await t(`${toSC("cannot ban sudo")}`)},{quoted:m});

   let reason=args.slice(1).join(" ")||"violated storm x rules";
   if(db.find(x=>x.jid===target)) return await sock.sendMessage(m.chat,{text: await t(`${toSC("already banned")}`)},{quoted:m});

   db.push({jid:target, reason, date:new Date().toISOString(), by:m.sender, botId:botNum});
   fs.writeFileSync(path, JSON.stringify(db,null,2));

   await sock.sendMessage(m.chat,{react:{text:"🔨",key:m.key}});

   // if group, try kick
   if(m.chat.endsWith("@g.us")){
     try{ await sock.groupParticipantsUpdate(m.chat,[target],"remove"); }catch{}
   }

   await sock.sendMessage(m.chat,{text: await t(`🔨 ${toSC("banned")}: @${target.split("@")[0]}\n${toSC("reason")}: ${reason}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m, mentions:[target]});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   let err=await translateText(`Error: ${e.message}`,botNum);
   await sock.sendMessage(m.chat,{text:err},{quoted:m})
 }
}
}
