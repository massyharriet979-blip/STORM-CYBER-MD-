const { translateText } = require('../lib/translate');
const os = require('os');

module.exports={
name:"bot",
aliases:["botstatus","botinfo","storm"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   let uptime=process.uptime();
   let h=Math.floor(uptime/3600);
   let min=Math.floor((uptime%3600)/60);
   let sec=Math.floor(uptime%60);
   let uptimeStr=`${h}h ${min}m ${sec}s`;

   let ram=`${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB`;
   let platform=os.platform();
   let arch=os.arch();

   let caption=`
╭─❍ ${toSC("storm cyber md")} ❍─
│
│ 🤖 ${toSC("bot")}: ${toSC("storm x cyber md")}
│ 👑 ${toSC("owner")}: 256794110913
│ ⚡ ${toSC("status")}: ${toSC("online")}
│ ⏱️ ${toSC("uptime")}: ${uptimeStr}
│ 💾 ${toSC("ram")}: ${ram}
│ 🖥️ ${toSC("platform")}: ${platform} ${arch}
│ 📦 ${toSC("version")}: 2.0.0
│ 🔗 ${toSC("prefix")}:.
│
│ ${toSC("a powerful whatsapp bot made with love")}
│ ${toSC("fast, secure, and always active")}
│
╰────────────────
> ${toSC("powered by storm")} 𝐗
`.trim();

   await sock.sendMessage(m.chat,{
     text: await t(caption),
     contextInfo:{
       forwardingScore:999,
       isForwarded:true,
       forwardedNewsletterMessageInfo:{
         newsletterJid:"120363414065055650@newsletter",
         newsletterName:"STORM CYBER MD",
         serverMessageId:1
       },
       externalAdReply:{
         title: toSC("storm cyber md - active"),
         body: `${toSC("uptime")}: ${uptimeStr}`,
         thumbnailUrl: "https://i.ibb.co/your-logo.jpg",
         sourceUrl: "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P",
         mediaType:1,
         renderLargerThumbnail:true
       }
     }
   },{quoted:m});

   await sock.sendMessage(m.chat,{react:{text:"🤖",key:m.key}});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
