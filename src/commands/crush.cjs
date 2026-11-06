function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

function delay(ms){ return new Promise(r=>setTimeout(3000,ms)); }

export default{
name:"crush",
aliases:["mycrush","crushcheck"],
execute: async(sock,m,args)=>{
 let target = args[0] || m.mentionedJid?.[0]?.split('@')[0] || m.quoted?.sender?.split('@')[0] || null;

 let text0 = `* ${toSC("crush system starting")}...*\n> ${toSC("scanning")} ${target? `@${target}` : toSC("your crush")}...`;

 let sent = await sock.sendMessage(m.chat,{text: text0, mentions: target? [target+"@s.whatsapp.net"] : []},{quoted:m});

 await delay(2000);
 await sock.sendMessage(m.chat,{text:`*🔍 ${toSC("analyzing data")}...*`, edit: sent.key},{quoted:m});

 await delay(3000);
 await sock.sendMessage(m.chat,{text:`*📡 ${toSC("connecting to server")}...*`, edit: sent.key},{quoted:m});

 await delay(2000);

 // FAIL - NOT WORKING
 let fail = `*❌ ${toSC("crush system failed")}*\n\n*${toSC("error")}:* ${toSC("service unavailable")}\n*${toSC("reason")}:* ${toSC("crush not found")}\n\n> ${toSC("try again later, system is down")}`;

 return await sock.sendMessage(m.chat,{
  text: success,
  footer: toSC("crush is online"),
  buttons:[
   {buttonId:`.crush`, buttonText:{displayText:`💔 ${toSC("try again")}`}, type:1},
   {buttonId:`.dev`, buttonText:{displayText:`👑 ${toSC("owner")}`}, type:1},
  ],
  headerType:1,
  edit: sent.key
 },{quoted:m});
}
}
