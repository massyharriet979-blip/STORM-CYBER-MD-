const { translateText } = require('../lib/translate');

module.exports={
name:"spam",
aliases:["spammer"],
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
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("quantum clearance required")}\n${toSC("owner or sudo or subbot only")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   if(!args[0]) return await sock.sendMessage(m.chat,{text: await t(`${toSC("usage")}:.spam 88 hello world\n${toSC("max")} 0, ${toSC("delay")} 1s\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

   let count=parseInt(args[0]);
   if(isNaN(count) || count<1) count=1;
   if(count>5) count=5; // HARD LIMIT

   let text=args.slice(1).join(" ");
   if(!text && m.quoted) text=m.quoted.text||m.quoted.body||"";
   if(!text) text="CYBER-MD SPAM";

   await sock.sendMessage(m.chat,{react:{text:"💣",key:m.key}});
   await sock.sendMessage(m.chat,{text: await t(`${toSC("spamming")} ${count}x ${toSC("with")} 1s ${toSC("delay")}...`)},{quoted:m});

   for(let i=0;i<count;i++){
     await new Promise(r=>setTimeout(r,1000)); // 1 second delay
     await sock.sendMessage(m.chat,{text: await t(text)});
   }

   await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   let err=await translateText(`Error: ${e.message}`,botNum);
   await sock.sendMessage(m.chat,{text:err},{quoted:m})
 }
}
}
