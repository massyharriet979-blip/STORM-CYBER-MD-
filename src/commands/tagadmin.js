const { translateText } = require('../lib/translate');

module.exports={
name:"tagadmin",
aliases:["admins","tagadmins","admintag"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   if(!m.chat.endsWith("@g.us")){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("group only command")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   const config=require('../../config');
   let sender=m.sender.split("@")[0];
   let botId=botNum.split("@")[0];
   let isOwner=sender===botId;
   let isSudo=config.SUDO?config.SUDO.includes(sender):false;

   let metadata=await sock.groupMetadata(m.chat);
   let participants=metadata.participants;
   let senderParticipant=participants.find(p=>p.id===m.sender);
   let isSenderAdmin=senderParticipant?.admin!==null && senderParticipant?.admin!==undefined;

   // RESTRICTIONS: group admin OR bot owner OR sudo OR subbot
   if(!isSenderAdmin &&!isOwner &&!isSudo &&!m.isSubBot){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("admin only")}\n${toSC("only group admins, bot owner or sudo can use this")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   let admins=participants.filter(p=>p.admin!==null).map(p=>p.id);
   if(admins.length===0) return await sock.sendMessage(m.chat,{text: await t(`${toSC("no admins found")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

   let customText=m.text?m.text.replace(/^.tagadmin\s*/i,"").trim():"";
   if(!customText) customText=`${toSC("attention all admins")}`;

   let text=`╭─❍ ${toSC("tagging admins")} ❍─\n│\n│ ${customText}\n│\n`;
   admins.forEach((jid,i)=>{
     text+=`│ ${i+1}. @${jid.split("@")[0]}\n`;
   });
   text+=`│\n│ ${toSC("total")}: ${admins.length}\n╰───────────────\n\n> ${toSC("powered by storm")} 𝐗`;

   await sock.sendMessage(m.chat,{text: await t(text), mentions:admins},{quoted:m});
   await sock.sendMessage(m.chat,{react:{text:"👑",key:m.key}});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
