const { translateText } = require('../lib/translate');

module.exports={
name:"kickall",
aliases:["removeall","kickallmembers"],
execute: async(sock,m,args)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   if(!m.chat.endsWith("@g.us")){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("group only command")}\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   const config=require('../../config');
   let sender=m.sender.split("@")[0];
   let isOwner=sender===botNum.split("@")[0];
   let isSudo=config.SUDO?config.SUDO.includes(sender):false;

   let metadata=await sock.groupMetadata(m.chat);
   let participants=metadata.participants;
   let botParticipant=participants.find(p=>p.id.split("@")[0]===botNum.split("@")[0] || p.id===sock.user.id);
   let isBotAdmin=botParticipant?.admin!==null && botParticipant?.admin!==undefined;
   let senderParticipant=participants.find(p=>p.id===m.sender);
   let isSenderAdmin=senderParticipant?.admin!==null && senderParticipant?.admin!==undefined;

   // ADMIN CHECK
   if(!isSenderAdmin &&!isOwner &&!isSudo){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("admin only command")}\n${toSC("you need to be group admin")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   if(!isBotAdmin){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("i need to be admin to kick")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   // safety: need confirm
   if(!args[0] || args[0]!=="--force"){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("warning: this will remove all members")}\n${toSC("type")}:.kickall --force\n${toSC("to confirm")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   await sock.sendMessage(m.chat,{react:{text:"🔨",key:m.key}});

   // kick all except bot and owner/sudo and group admins if you want keep admins, here we kick non-admins only for safety
   // if you want kick EVERYONE except bot, change filter to only bot
   let toKick=participants.filter(p=>{
     let id=p.id;
     if(id===sock.user.id) return false;
     if(id.split("@")[0]===botNum) return false;
     if(p.admin!==null) return false; // keep admins
     if(config.SUDO && config.SUDO.includes(id.split("@")[0])) return false;
     if(id===m.sender) return false; // keep command sender
     return true;
   }).map(p=>p.id);

   // if you want literally ALL (except bot), use this instead:
   // let toKick=participants.filter(p=>p.id!==sock.user.id && p.id.split("@")[0]!==botNum).map(p=>p.id);

   if(toKick.length===0){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("no members to kick")}\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   await sock.sendMessage(m.chat,{text: await t(`${toSC("kicking")} ${toKick.length} ${toSC("members")}...\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

   // kick in batches to avoid rate limit
   for(let jid of toKick){
     try{
       await sock.groupParticipantsUpdate(m.chat,[jid],"remove");
       await new Promise(r=>setTimeout(r,800));
     }catch{}
   }

   await sock.sendMessage(m.chat,{text: await t(`${toSC("done")} - ${toKick.length} ${toSC("removed")}\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
