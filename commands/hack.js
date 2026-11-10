function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

function delay(ms){ return new Promise(r=>setTimeout(3000, ms)); }

export default{
name:"hack",
aliases:["hacker","hackcheck"],
execute: async(sock,m,args)=>{
 let target = m.mentionedJid?.[0]?.split('@')[0] || args[0] || m.quoted?.sender?.split('@')[0] || toSC("user");

 let sent = await sock.sendMessage(m.chat,{
  text:`*💻 ${toSC("hack system starting")}*\n> ${toSC("target")}: ${target}\n> ${toSC("injecting")}...`
 },{quoted:m});

 await delay(2000);
 await sock.sendMessage(m.chat,{text:`*🔍 ${toSC("bypassing security")}...*\n> ${toSC("status")}: true`, edit: sent.key},{quoted:m});

 await delay(2500);
 await sock.sendMessage(m.chat,{text:`*📡 ${toSC("accessing database")}...*\n> ${toSC("status")}: true`, edit: sent.key},{quoted:m});

 await delay(2000);
 await sock.sendMessage(m.chat,{text:`*🔓 ${toSC("cracking password")}...*\n> ${toSC("status")}: true`, edit: sent.key},{quoted:m});

 await delay(1500);

 let finalTxt = `*❌ ${toSC("hack failed")}*\n\n*${toSC("target")}:* ${target}\n*${toSC("hacked")}:* false\n*${toSC("access")}:* false\n*${toSC("success")}:* false\n\n> ${toSC("could not hack, system protected")}\n> ${toSC(" ")}`;

 return await sock.sendMessage(m.chat,{
  text: finalTxt
 },{quoted:m});
}
}
