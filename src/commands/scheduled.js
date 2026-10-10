const fs=require('fs');
const path='./src/database/schedule.json';
const { translateText } = require('../lib/translate');

module.exports={
name:"scheduled",
aliases:["schedules","reminders","timers"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);
   await sock.sendMessage(m.chat,{react:{text:"📅",key:m.key}});

   if(!fs.existsSync(path)){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("no scheduled messages")}\n${toSC("use")}:.schedule 10s hello\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   let db=JSON.parse(fs.readFileSync(path));
   let mine=db.filter(x=>x.botId===botNum);

   if(mine.length===0){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("no scheduled messages")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   let now=Date.now();
   let txt=`${toSC("storm x scheduler")}\n${toSC("total")}: ${mine.length}\n\n`;

   for(let i=0;i<mine.length;i++){
     let j=mine[i];
     let remain=Math.max(0,j.fireAt-now);
     let s=Math.floor(remain/1000)%60;
     let mnt=Math.floor(remain/60000)%60;
     let h=Math.floor(remain/3600000);
     let timeLeft=h>0?`${h}h ${mnt}m`:mnt>0?`${mnt}m ${s}s`:`${s}s`;
     let date=new Date(j.fireAt).toLocaleString();
     txt+=`${i+1}. 🆔 ${j.id.slice(-6)} | ⏳ ${timeLeft}\n 📝 ${j.text.slice(0,40)}\n 📅 ${date}\n 💬 ${j.chat.split("@")[0]}\n\n`;
   }
   txt+=`${toSC("to cancel")}:.schedule del <id>\n> ${toSC("powered by storm")} 𝐗`;

   await sock.sendMessage(m.chat,{text: await t(txt)},{quoted:m});
   await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   let err=await translateText(`Error: ${e.message}`,botNum);
   await sock.sendMessage(m.chat,{text:err},{quoted:m})
 }
}
}
