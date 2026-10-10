const fs=require('fs');
const { translateText } = require('../lib/translate');

module.exports={
name:"unstick",
aliases:["fix","unfreeze","clearstuck","resetbot"],
execute: async(sock,m)=>{
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
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("quantum clearance required")}\n${toSC("owner or sudo or subbot only")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   await sock.sendMessage(m.chat,{react:{text:"🛠️",key:m.key}});
   let msg=await sock.sendMessage(m.chat,{text: await t(`${toSC("diagnosing stuck process")}...\n> [■□□□] 25%`)},{quoted:m});

   // 1. Clear temp files
   try{
     let tmp=['./tmp','./temp'];
     for(let p of tmp){ if(fs.existsSync(p)){ fs.readdirSync(p).forEach(f=>{ try{fs.unlinkSync(`${p}/${f}`)}catch{}})}}
   }catch{}

   setTimeout(async()=>{
     await sock.sendMessage(m.chat,{text: await t(`${toSC("clearing message queue")}...\n> [■■□□] 50%\n✓ ${toSC("temp cleared")}`),edit:msg.key});
   },800);

   setTimeout(async()=>{
     // 2. Clear Baileys store if exists
     try{
       if(sock.store) sock.store.contacts={};
       if(global.store) global.store={};
     }catch{}
     await sock.sendMessage(m.chat,{text: await t(`${toSC("resetting socket")}...\n> [■■■□] 75%\n✓ ${toSC("queue cleared")}\n✓ ${toSC("store cleared")}`),edit:msg.key});
   },1600);

   setTimeout(async()=>{
     let finalTxt=`${toSC("bot unstuck successfully")}

${toSC("status")}: 🟢 ${toSC("online")}
${toSC("memory")}: ${toSC("cleared")}
${toSC("queue")}: ${toSC("reset")}
${toSC("uptime")}: ${Math.floor(process.uptime()/60)}m

${toSC("try sending a command now")}

> ${toSC("powered by storm")} 𝐗`;
     await sock.sendMessage(m.chat,{text: await t(finalTxt),edit:msg.key});
     await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
   },2400);

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   let err=await translateText(`Error: ${e.message}`,botNum);
   await sock.sendMessage(m.chat,{text:err},{quoted:m})
 }
}
}
