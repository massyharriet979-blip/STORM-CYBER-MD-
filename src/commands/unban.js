const fs=require('fs');
const path='./src/database/banned.json';
const { translateText } = require('../lib/translate');

module.exports={
name:"unban",
aliases:["unblock","pardon"],
execute: async(sock,m,args)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);
   if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([],null,2));
   let db=JSON.parse(fs.readFileSync(path));

   let target=null;
   if(m.quoted) target=m.quoted.sender;
   else if(m.mentionedJid && m.mentionedJid[0]) target=m.mentionedJid[0];
   else if(args[0]) target=args[0].replace("@","")+"@s.whatsapp.net";

   if(!target) return await sock.sendMessage(m.chat,{text: await t(`${toSC("usage")}:.unban @user / reply`)},{quoted:m});

   let before=db.length;
   db=db.filter(x=>x.jid!==target);
   fs.writeFileSync(path, JSON.stringify(db,null,2));

   await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
   await sock.sendMessage(m.chat,{text: await t(before===db.length?`${toSC("not banned")}`:`✅ ${toSC("unbanned")} @${target.split("@")[0]}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m, mentions:[target]});
 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
