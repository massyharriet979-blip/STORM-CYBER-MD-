module.exports={
name:"testalive",
aliases:["alive","bot","test"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let uptime = process.uptime();
   let h = Math.floor(uptime/3600);
   let min = Math.floor((uptime%3600)/60);
   let sec = Math.floor(uptime%60);

   let text = `╭─── ${toSC("storm x alive")} ───╮
│
│ ${toSC("status")}: 🟢 ${toSC("online")}
│ ${toSC("bot")}: 𝐂𝐘𝐁𝐄𝐑-𝐌𝐃
│ ${toSC("version")}: 2.5.0
│ ${toSC("uptime")}: ${h}h ${min}m ${sec}s
│ ${toSC("mode")}: ${toSC("public")}
│ ${toSC("engine")}: Baileys
│
│ ${toSC("ping")}: ${Date.now()-new Date(m.messageTimestamp*1000)}ms
│
╰─── > ${toSC("powered by storm")} 𝐗 ───╯`;

   await sock.sendMessage(m.chat,{react:{text:"⚡",key:m.key}});
   await sock.sendMessage(m.chat,{text},{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
