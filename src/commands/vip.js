import fs from 'fs';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

function getVipDB(botNumber){
 let p = `./database/vip_${botNumber}.json`;
 if(!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify([]));
 return p;
}

export default{
name:"vip",
aliases:["mycard","diamond"],
execute: async(sock,m,args)=>{
 let botNumber = m.botNumber;
 let dbPath = getVipDB(botNumber);
 let vipList = [];
 try{ vipList = JSON.parse(fs.readFileSync(dbPath)); }catch{ vipList = []; }

 let senderNum = m.senderNum;
 let isVip = vipList.includes(senderNum) || m.isOwner;
 let isOwner = m.isOwner;

 // IF NO ARGS - SHOW HIS CARD
 if(!args[0] || args[0].toLowerCase() === "mycard" || args[0].toLowerCase() === "card"){

  let status = isOwner? "👑 OWNER - UNLIMITED" : (isVip? "💎 VIP ACTIVE" : "❌ NOT VIP");
  let level = isOwner? "∞ INFINITY" : (isVip? "GOLD" : "FREE");
  let expiry = isOwner? "NEVER" : (isVip? "30 DAYS" : "-");

  let card = `╭━─━─━─❰ 💎 𝐕𝐈𝐏 𝐂𝐀𝐑𝐃 ❱─━─━─━╮
┃
┃ ${toSC("user")}: @${senderNum}
┃ ${toSC("status")}: ${status}
┃ ${toSC("level")}: ${level}
┃ ${toSC("expiry")}: ${expiry}
┃ ${toSC("bot")}: ${botNumber}
┃
┃ ${isVip? `✅ ${toSC("you have premium access")}` : `❌ ${toSC("you need vip to use premium cmds")}`}
┃
╰━━━━━━━━━━━━━━━━━━━━❒

> ${toSC("storm cyber md vip system")}`;

  let buttons = [
   {buttonId: `.vip mycard`, buttonText:{displayText:`💳 My Card`}, type:1},
   {buttonId: `.vip benefits`, buttonText:{displayText:`✨ Benefits`}, type:1},
   {buttonId: `.vip list`, buttonText:{displayText:`📜 Vip List`}, type:1},
  ];

  // Owner extra buttons
  if(isOwner){
   buttons.push({buttonId: `.vip add`, buttonText:{displayText:`➕ Add Vip`}, type:1});
  }

  return await sock.sendMessage(m.chat,{
   text: card,
   mentions:[m.sender],
   footer: toSC("storm x - vip system"),
   buttons: buttons,
   headerType: 1
  },{quoted:m});
 }

 // BENEFITS
 if(args[0].toLowerCase() === "benefits"){
  let txt = `*💎 ${toSC("vip benefits")}*\n\n`
  +`• ${toSC("ghostmode unlimited")}\n`
  +`• ${toSC("autolike + autoview")}\n`
  +`• ${toSC("antidelete full")}\n`
  +`• ${toSC("no limits")}\n`
  +`• ${toSC("fun commands")}\n\n`
  +`> ${toSC("price: free for subbot owners")}`;

  return await sock.sendMessage(m.chat,{
   text: txt,
   footer: toSC("become vip"),
   buttons: [
    {buttonId: `.vip mycard`, buttonText:{displayText:`💳 My Card`}, type:1},
    {buttonId: `.dev`, buttonText:{displayText:`👑 Contact Owner`}, type:1},
   ],
   headerType: 1
  },{quoted:m});
 }

 // === RESTRICTED PART - ADD / DEL / LIST ===
 if(["add","del","remove","list"].includes(args[0].toLowerCase())){
  if(!isOwner){
   return await sock.sendMessage(m.chat,{
    text:`*⛔ ${toSC("quantum clearance required")}*\n\n${toSC("only owner can manage vip")}\n\n> ${toSC("your card")}:.vip`,
    footer: toSC("restricted"),
    buttons:[
     {buttonId: `.vip mycard`, buttonText:{displayText:`💳 My Card`}, type:1},
     {buttonId: `.dev`, buttonText:{displayText:`👑 Owner`}, type:1},
    ],
    headerType: 1
   },{quoted:m});
  }

  let action = args[0].toLowerCase();
  let num = args[1]?.replace(/[^0-9]/g,'') || m.mentionedJid?.[0]?.split('@')[0] || m.quoted?.sender?.split('@')[0];

  if(action === "add"){
   if(!num) return await sock.sendMessage(m.chat,{text:`*${toSC("example")}:*.vip add 2557xxxx\n> ${toSC("or reply to user")}`},{quoted:m});
   if(vipList.includes(num)){
    return await sock.sendMessage(m.chat,{text:`*💎 @${num} ${toSC("already vip")}*`, mentions:[num+"@s.whatsapp.net"]},{quoted:m});
   }
   vipList.push(num);
   fs.writeFileSync(dbPath, JSON.stringify(vipList, null, 2));
   return await sock.sendMessage(m.chat,{
    text:`*✅ VIP ADDED*\n\n*${toSC("user")}:* @${num}\n*${toSC("status")}:* 💎 GOLD\n\n> ${toSC("card issued")}`,
    mentions:[num+"@s.whatsapp.net", m.sender],
    footer: toSC("vip activated"),
    buttons:[
     {buttonId: `.vip mycard`, buttonText:{displayText:`💳 Check Card`}, type:1},
     {buttonId: `.vip list`, buttonText:{displayText:`📜 List`}, type:1},
    ],
    headerType: 1
   },{quoted:m});
  }

  if(action === "del" || action === "remove"){
   if(!num) return await sock.sendMessage(m.chat,{text:`*.vip del 255xxxx*`},{quoted:m});
   vipList = vipList.filter(x=>x!==num);
   fs.writeFileSync(dbPath, JSON.stringify(vipList, null, 2));
   return await sock.sendMessage(m.chat,{text:`*❌ @${num} ${toSC("removed from vip")}*`, mentions:[num+"@s.whatsapp.net"]},{quoted:m});
  }

  if(action === "list"){
   if(vipList.length === 0) return await sock.sendMessage(m.chat,{text:`*${toSC("no vip users yet")}*`},{quoted:m});
   let txt = `*💎 ${toSC("vip list")} - ${vipList.length}*\n\n`;
   vipList.forEach((n,i)=> txt+=`${i+1}. ${n} - GOLD\n`);
   return await sock.sendMessage(m.chat,{
    text: txt,
    footer: toSC("vip members"),
    buttons:[
     {buttonId: `.vip mycard`, buttonText:{displayText:`💳 My Card`}, type:1},
    ],
    headerType: 1
   },{quoted:m});
  }
 }

}
}
