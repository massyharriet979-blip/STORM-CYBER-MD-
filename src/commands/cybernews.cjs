const fs=require('fs');
const path='./src/database/cybernews.json';
const { translateText } = require('../lib/translate');

module.exports={
name:"cybernews",
aliases:["cnews","news","stormnews","addnews"],
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

   if(!fs.existsSync('./src/database')) fs.mkdirSync('./src/database',{recursive:true});
   if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([],null,2));

   let db=JSON.parse(fs.readFileSync(path));
   let sub=args[0]?.toLowerCase()||"latest";

   // ADD NEWS - only owner/sudo/subbot
   if(["add","put","create","new"].includes(sub)){
     if(!isOwner &&!isSudo &&!isSubBot){
       await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
       return await sock.sendMessage(m.chat,{text: await t(`${toSC("quantum clearance required")}\n${toSC("owner only to add news")}`)},{quoted:m});
     }
     let newsText=args.slice(1).join(" ").trim();
     if(m.quoted &&!newsText) newsText=m.quoted.text||m.quoted.body||"";
     if(!newsText) return await sock.sendMessage(m.chat,{text: await t(`${toSC("usage")}:.cybernews add Your news here\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

     let id=Date.now().toString(36);
     let item={id, text:newsText, by:m.sender, botId:botNum, date:new Date().toISOString(), views:0};
     db.unshift(item);
     if(db.length>50) db=db.slice(0,50); // keep last 50
     fs.writeFileSync(path, JSON.stringify(db,null,2));

     await sock.sendMessage(m.chat,{react:{text:"📰",key:m.key}});
     // broadcast style message
     let header=`${toSC("storm x cyber news")}\n\n`;
     let footer=`\n\n📅 ${new Date().toLocaleString()}\n> ${toSC("powered by storm")} 𝐗`;
     await sock.sendMessage(m.chat,{text: await t(header+newsText+footer)},{quoted:m});
     return;
   }

   // DELETE
   if(["del","delete","remove"].includes(sub)){
     if(!isOwner &&!isSudo) return;
     let id=args[1];
     let len=db.length;
     db=db.filter(x=>x.id!==id &&!x.id.endsWith(id));
     fs.writeFileSync(path, JSON.stringify(db,null,2));
     return await sock.sendMessage(m.chat,{text: await t(len===db.length?`${toSC("not found")}`:`${toSC("news deleted")}`)},{quoted:m});
   }

   // LIST / LATEST
   if(db.length===0){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("no news yet")}\n${toSC("add with")}:.cybernews add Your news\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   if(sub==="list"||sub==="all"){
     let txt=`${toSC("cyber news archive")} - ${db.length}\n\n`;
     db.slice(0,10).forEach((n,i)=>{
       txt+=`${i+1}. 🆔${n.id} | ${new Date(n.date).toLocaleDateString()}\n${n.text.slice(0,80)}${n.text.length>80?'...':''}\n\n`;
     });
     txt+=`${toSC("read full")}:.cybernews <number>\n> ${toSC("powered by storm")} 𝐗`;
     return await sock.sendMessage(m.chat,{text: await t(txt)},{quoted:m});
   }

   // READ SPECIFIC NUMBER OR LATEST
   let index=parseInt(sub);
   let item=null;
   if(!isNaN(index) && index>=1 && index<=db.length){
     item=db[index-1];
   } else {
     item=db[0]; // latest
   }

   item.views=(item.views||0)+1;
   fs.writeFileSync(path, JSON.stringify(db,null,2));

   let news=`${toSC("storm x cyber news")} 📰\n${toSC("latest update")}\n\n${item.text}\n\n📅 ${new Date(item.date).toLocaleString()}\n👁️ ${item.views} ${toSC("views")}\n\n${toSC("archive")}:.cybernews list\n> ${toSC("powered by storm")} 𝐗`;

   await sock.sendMessage(m.chat,{react:{text:"📰",key:m.key}});
   await sock.sendMessage(m.chat,{text: await t(news)},{quoted:m});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   let err=await translateText(`Error: ${e.message}`,botNum);
   await sock.sendMessage(m.chat,{text:err},{quoted:m})
 }
}
}
