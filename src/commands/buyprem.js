import fs from 'fs';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"buyprem",
aliases:["buypremium","prem","mycard","vip"],
execute: async(sock,m,args)=>{
 let dbPath = `./database/vip_${m.botNumber}.json`;
 if(!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify([]));
 let vipList = [];
 try{ vipList = JSON.parse(fs.readFileSync(dbPath)); }catch{ vipList = []; }

 let senderNum = m.senderNum;
 let isVip = vipList.includes(senderNum) || m.isOwner;

 // SHOW CARD - EVERYONE CAN USE.buyprem
 if(!args[0] || args[0]==="mycard" || args[0]==="card"){
  let status = m.isOwner? "OWNER - UNLIMITED" : (isVip? "PREMIUM ACTIVE" : "NOT PREMIUM");
  let card = `╭─❰ 💎 PREM CARD ❱─╮\n┃ User: @${senderNum}\n┃ Status: ${status}\n┃ Bot: ${m.botNumber}\n╰───────────❒\n\n${!isVip &&!m.isOwner? `> ${toSC("buy premium to unlock")}` : `> ${toSC("enjoy premium access")}`}`;
  return await sock.sendMessage(m.chat,{
   text: card,
   mentions:[m.sender],
   footer: "STORM PREMIUM",
   buttons:[
    {buttonId: `.buyprem mycard`, buttonText:{displayText:`💳 My Card`}, type:1},
    {buttonId: `.buyprem benefits`, buttonText:{displayText:`✨ Benefits`}, type:1},
    {buttonId: `.buyprem price`, buttonText:{displayText:`💰 Price`}, type:1},
   ],
   headerType:1
  },{quoted:m});
 }

 if(args[0]==="benefits"){
  return await sock.sendMessage(m.chat,{
   text:`*💎 PREM BENEFITS*\n\n• ghostmode\n• autolike\n• antidelete full\n• no limits\n• vip commands`,
   footer:"BENEFITS",
   buttons:[{buttonId:`.buyprem mycard`, buttonText:{displayText:`💳 My Card`}, type:1},{buttonId:`.dev`, buttonText:{displayText:`👑 Owner`}, type:1}],
   headerType:1
  },{quoted:m});
 }

 if(args[0]==="price"){
  return await sock.sendMessage(m.chat,{
   text:`*💰 PREM PRICE*\n\n• 1 WEEK - $2\n• 1 MONTH - $5\n• PERM - $10\n\n> ${toSC("contact owner")}`,
   footer:"PRICE",
   buttons:[{buttonId:`.dev`, buttonText:{displayText:`👑 Buy Now`}, type:1}],
   headerType:1
  },{quoted:m});
 }

 // === RESTRICTED: ADD / DEL / LIST ===
 let action = args[0].toLowerCase();
 if(["add","del","remove","list"].includes(action)){

  // OWNER ONLY
  if(!m.isOwner){
   return await sock.sendMessage(m.chat,{
    text:`*⛔ QUANTUM CLEARANCE REQUIRED, OWNER ONLY*`,
    footer: toSC("restricted command"),
    buttons:[
     {buttonId: `.buyprem mycard`, buttonText:{displayText:`💳 My Card`}, type:1},
     {buttonId: `.dev`, buttonText:{displayText:`👑 Owner`}, type:1},
    ],
    headerType:1
   },{quoted:m});
  }

  let num = args[1]?.replace(/[^0-9]/g,'') || m.mentionedJid?.[0]?.split('@')[0] || m.quoted?.sender?.split('@')[0];

  if(action==="add"){
   if(!num) return await sock.sendMessage(m.chat,{text:`*.buyprem add 255xxxx*`},{quoted:m});
   if(!vipList.includes(num)) vipList.push(num);
   fs.writeFileSync(dbPath, JSON.stringify(vipList, null, 2));
   return await sock.sendMessage(m.chat,{text:`*✅ @${num} ADDED TO PREMIUM*`, mentions:[num+"@s.whatsapp.net"]},{quoted:m});
  }

  if(action==="del" || action==="remove"){
   if(!num) return await sock.sendMessage(m.chat,{text:`*.buyprem del 255xxxx*`},{quoted:m});
   vipList = vipList.filter(x=>x!==num);
   fs.writeFileSync(dbPath, JSON.stringify(vipList, null, 2));
   return await sock.sendMessage(m.chat,{text:`*❌ @${num} REMOVED FROM PREMIUM*`, mentions:[num+"@s.whatsapp.net"]},{quoted:m});
  }

  if(action==="list"){
   let txt = `*PREM LIST - ${vipList.length}*\n\n` + vipList.map((n,i)=>`${i+1}. ${n}`).join("\n");
   return await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  }
 }
}
}
