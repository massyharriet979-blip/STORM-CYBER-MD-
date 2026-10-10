const fs=require('fs');
const path=require('path');
const { translateText } = require('../lib/translate');
const modePath=path.join(__dirname,'../database/mode.json');

module.exports={
name:"self",
aliases:["selfmode","inbox","inboxmode","privateonly","onlyme"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   // OWNER ONLY - no sudo/admin
   if(m.sender.split("@")[0]!==botNum.split("@")[0] && m.sender!==sock.user.id){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text: await t(`**${toSC("owner only command")}**\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   fs.writeFileSync(modePath,JSON.stringify("self"));
   await sock.sendMessage(m.chat,{react:{text:"👁️",key:m.key}});
   return await sock.sendMessage(m.chat,{text: await t(`**╭─❍ ${toSC("mode changed")} ❍─**\n**│**\n**│ 👁️ ${toSC("bot locked for you only")}**\n**│ 🚫 ${toSC("bot will not respond to any command")}**\n**│ 🔐 ${toSC("self mode activated")}**\n**│**\n**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
