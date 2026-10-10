const { translateText } = require('../lib/translate');

module.exports={
name:"link",
aliases:["grouplink","invite","invitelink"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   if(!m.chat.endsWith("@g.us")){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("group only command")}\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   try{
     let code=await sock.groupInviteCode(m.chat);
     let link=`https://chat.whatsapp.com/${code}`;
     let meta=await sock.groupMetadata(m.chat);
     let txt=`╭─❍ ${toSC("group link")} ❍─\n│\n│ 📛 ${toSC("name")}: ${meta.subject}\n│ 🔗 ${toSC("link")}: ${link}\n│\n╰────────────\n\n> ${toSC("powered by storm")} 𝐗`;
     await sock.sendMessage(m.chat,{text: await t(txt)},{quoted:m});
     await sock.sendMessage(m.chat,{react:{text:"🔗",key:m.key}});
   }catch(e){
     await sock.sendMessage(m.chat,{text: await t(`${toSC("i need to be admin to get link")}\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

 }catch(err){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${err.message}`,botNum)},{quoted:m})
 }
}
}
