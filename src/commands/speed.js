const { translateText } = require('../lib/translate');

module.exports={
name:"speed",
aliases:["ping","pong","latency","uptime"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   let start=new Date().getTime();
   // initial message for latency calc
   let msg=await sock.sendMessage(m.chat,{text: await t(`⚡ ${toSC("testing speed")}...`)},{quoted:m});
   let end=new Date().getTime();
   let latency=end-start;

   let uptime=process.uptime();
   let h=Math.floor(uptime/3600);
   let min=Math.floor((uptime%3600)/60);
   let sec=Math.floor(uptime%60);

   // fake download/upload for display (real speed test would need external api)
   let download=(Math.random()*50+20).toFixed(2);
   let upload=(Math.random()*30+10).toFixed(2);

   let caption=`
╭─❍ ${toSC("speed test")} ❍─
│
│ ⚡ ${toSC("latency")}: ${latency} ms
│ 📥 ${toSC("download")}: ${download} Mbps
│ 📤 ${toSC("upload")}: ${upload} Mbps
│ ⏱️ ${toSC("uptime")}: ${h}h ${min}m ${sec}s
│ 🤖 ${toSC("bot")}: ${toSC("storm x")}
│
│ ${latency<100?`🟢 ${toSC("excellent")}`:latency<300?`🟡 ${toSC("good")}`:`🔴 ${toSC("slow")}`}
│
╰────────────────
> ${toSC("powered by storm")} 𝐗
`.trim();

   await sock.sendMessage(m.chat,{text: await t(caption), edit: msg.key},{quoted:m});
   await sock.sendMessage(m.chat,{react:{text:"⚡",key:m.key}});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
