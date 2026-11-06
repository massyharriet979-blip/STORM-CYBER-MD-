const { translateText } = require('../lib/translate');

module.exports={
name:"listsudo",
aliases:["sudolist","allsudo","showsudo"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   const config=require('../../config');
   let botNum=sock.user?.id?.split(":")[0]||"";
   let botId=botNum.split("@")[0];
   let sender=m.sender.split("@")[0];
   let isOwner=sender===botId;
   let isSubBot=m.isSubBot||false;
   let t=async(txt)=>await translateText(txt,botNum);

   // OWNER ONLY OR SUBBOT
   if(!isOwner &&!isSubBot){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("owner only or subbot")}\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   let sudoList=config.SUDO||[];
   await sock.sendMessage(m.chat,{react:{text:"👑",key:m.key}});

   if(sudoList.length===0){
     return await sock.sendMessage(m.chat,{text: await t(`╭─❍ ${toSC("sudo list")} ❍─\n│ ${toSC("no sudo users found")}\n╰──────────────\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   let boxTop=`╭─❍ ${toSC("storm x sudo list")} ❍─`;
   let boxBottom=`╰──────────────`;
   let countLine=`│ ${toSC("total")}: ${sudoList.length} ${toSC("users")}`;

   let users=``;
   for(let i=0;i<sudoList.length;i++){
     let num=sudoList[i].replace(/[^0-9]/g,"");
     let tag=num?`@${num}`:sudoList[i];
     users+=`│ ${i+1}. ${tag}\n`;
   }

   let final=`${boxTop}\n${countLine}\n│\n${users}${boxBottom}\n\n> ${toSC("powered by storm")} 𝐗`;
   // small caps already, but ensure lower then convert
   // final is already in small caps for labels, numbers stay

   await sock.sendMessage(m.chat,{text: await t(final)},{quoted:m, mentions:sudoList.map(n=>n.includes("@")?n:n+"@s.whatsapp.net")});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
