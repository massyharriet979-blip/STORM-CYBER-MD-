const fs=require('fs');
const path='./src/database/schedule.json';
const { translateText } = require('../lib/translate');

function parseTime(str){
  let m=str.match(/^(\d+)(s|m|h|d)$/i);
  if(!m) return null;
  let n=parseInt(m[1]); let unit=m[2].toLowerCase();
  if(unit==='s') return n*1000;
  if(unit==='m') return n*60*1000;
  if(unit==='h') return n*60*60*1000;
  if(unit==='d') return n*24*60*60*1000;
}

module.exports={
name:"schedule",
aliases:["remind","timer","sch"],
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
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("quantum clearance required")}\n${toSC("owner or sudo or subbot only")}`)},{quoted:m});
   }

   if(!fs.existsSync('./src/database')) fs.mkdirSync('./src/database',{recursive:true});
   if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([],null,2));

   let subCmd=(args[0]||"").toLowerCase();

   // LIST
   if(subCmd==="list"||subCmd==="ls"){
     let db=JSON.parse(fs.readFileSync(path));
     let mine=db.filter(x=>x.botId===botNum && x.chat===m.chat);
     if(mine.length===0) return await sock.sendMessage(m.chat,{text: await t(`${toSC("no schedules")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
     let txt=`${toSC("scheduled messages")}: ${mine.length}\n\n`+mine.map((x,i)=>`${i+1}. ${x.timeStr} -> ${x.text.slice(0,30)} (id:${x.id.slice(-4)})`).join("\n");
     return await sock.sendMessage(m.chat,{text: await t(txt)},{quoted:m});
   }

   // CANCEL
   if(subCmd==="del"||subCmd==="cancel"||subCmd==="remove"){
     let id=args[1];
     let db=JSON.parse(fs.readFileSync(path));
     let len=db.length;
     db=db.filter(x=>!(x.botId===botNum && (x.id.endsWith(id)||x.id===id)));
     fs.writeFileSync(path, JSON.stringify(db,null,2));
     return await sock.sendMessage(m.chat,{text: await t(len===db.length?`${toSC("id not found")}`:`${toSC("schedule canceled")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   if(args.length<2) return await sock.sendMessage(m.chat,{text: await t(`${toSC("usage")}:\n.schedule 10s hello\n.schedule 5m reminder text\n.schedule 1h meeting\n.schedule 1d good morning\n.schedule list\n.schedule del <id>\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

   let timeStr=args[0];
   let ms=parseTime(timeStr);
   if(!ms) return await sock.sendMessage(m.chat,{text: await t(`${toSC("invalid time")}. ${toSC("use")} 10s,5m,1h,1d`)},{quoted:m});

   let text=args.slice(1).join(" ");
   if(!text) return await sock.sendMessage(m.chat,{text: await t(`${toSC("enter message to schedule")}`)},{quoted:m});

   let id=Date.now().toString()+Math.random().toString(36).slice(2,6);
   let fireAt=Date.now()+ms;
   let db=JSON.parse(fs.readFileSync(path));
   db.push({id, botId:botNum, chat:m.chat, text, timeStr, fireAt, sender:m.sender});
   fs.writeFileSync(path, JSON.stringify(db,null,2));

   await sock.sendMessage(m.chat,{react:{text:"⏰",key:m.key}});
   await sock.sendMessage(m.chat,{text: await t(`${toSC("scheduled in")} ${timeStr}\n${toSC("message")}: ${text}\n${toSC("id")}: ${id.slice(-6)}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});

   // set timer
   setTimeout(async()=>{
     try{
       let curr=fs.existsSync(path)?JSON.parse(fs.readFileSync(path)):[];
       let job=curr.find(x=>x.id===id);
       if(!job) return;
       await sock.sendMessage(job.chat,{text: await translateText(`⏰ ${toSC("scheduled reminder")}:\n\n${job.text}\n\n> ${toSC("scheduled")} ${job.timeStr} ${toSC("ago")}\n> ${toSC("powered by storm")} 𝐗`, job.botId)});
       let after=JSON.parse(fs.readFileSync(path)).filter(x=>x.id!==id);
       fs.writeFileSync(path, JSON.stringify(after,null,2));
     }catch{}
   },ms);

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   let err=await translateText(`Error: ${e.message}`,botNum);
   await sock.sendMessage(m.chat,{text:err},{quoted:m})
 }
}
}
