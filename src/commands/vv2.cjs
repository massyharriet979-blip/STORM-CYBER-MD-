const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { translateText } = require('../lib/translate');

module.exports={
name:"vv2",
aliases:["vvv2","viewonce2","cybervv"],
execute: async(sock,m,args)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   const config=require('../../config');
   let botNum=sock.user?.id?.split(":")[0]||"";
   let botId=botNum.split("@")[0];
   let sender=m.sender.split("@")[0];
   let isOwner=sender===botId;
   let isSudo=config.SUDO?config.SUDO.includes(sender)||config.SUDO.includes(m.sender):false;
   let t=async(txt)=>await translateText(txt,botNum);

   // OWNER ONLY - no sudo local as you said 👎
   if(!isOwner){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("owner only command")}\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   let quoted=m.quoted||m;
   let viewMsg=quoted.message?.viewOnceMessageV2?.message || quoted.message?.viewOnceMessage?.message || quoted.message?.viewOnceMessageV2Extension?.message;

   // also check direct
   if(!viewMsg){
     // if m itself is viewonce
     let direct=m.message?.viewOnceMessageV2?.message || m.message?.viewOnceMessage?.message;
     if(direct) viewMsg=direct;
   }

   if(!viewMsg){
     // check if quoted has image/video but not marked? try to pull anyway if it's viewonce wrapper
     if(!quoted.message?.imageMessage &&!quoted.message?.videoMessage &&!quoted.message?.audioMessage){
       // try nested
       let msg=quoted.message;
       if(msg?.ephemeralMessage) msg=msg.ephemeralMessage.message;
       viewMsg=msg;
       if(!viewMsg?.imageMessage &&!viewMsg?.videoMessage &&!viewMsg?.audioMessage){
         return await sock.sendMessage(m.chat,{text: await t(`${toSC("reply to a view once image/video/voice")}\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
       }
     } else {
       viewMsg=quoted.message;
     }
   }

   await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

   let type=Object.keys(viewMsg)[0];
   let media=viewMsg[type];
   let buffer=await downloadMediaMessage({message:{[type]:media}},'buffer',{}, {logger:console, reuploadRequest:sock.updateMediaMessage});

   let inbox=botNum+"@s.whatsapp.net"; // your own dm
   let caption=await t(`${toSC("cyber vvv")}\n${toSC("vv pulled to ur inbox successfully")}\n${toSC("image out in real quality")}\n> ${toSC("powered by storm")} 𝐗`);

   if(type==="imageMessage"){
     await sock.sendMessage(inbox,{image:buffer, caption});
   } else if(type==="videoMessage"){
     await sock.sendMessage(inbox,{video:buffer, caption});
   } else if(type==="audioMessage"){
     await sock.sendMessage(inbox,{audio:buffer, mimetype:'audio/mp4', ptt:media.ptt||false});
     await sock.sendMessage(inbox,{text:caption});
   } else {
     await sock.sendMessage(inbox,{text:caption});
     await sock.sendMessage(inbox,{image:buffer});
   }

   // also confirm in chat where command was used
   await sock.sendMessage(m.chat,{text: await t(`${toSC("cyber vvv")}\n${toSC("vv pulled to ur inbox successfully")}\n${toSC("check inbox")}\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

 }catch(e){
   console.log("vv2 error",e);
   let botNum=sock.user?.id?.split(":")[0]||"";
   let err=await translateText(`Error: ${e.message}`,botNum);
   await sock.sendMessage(m.chat,{text:err},{quoted:m});
   await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
 }
}
}
