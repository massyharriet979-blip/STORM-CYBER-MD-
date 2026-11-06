function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}
function delay(ms){ return new Promise(r=>setTimeout(r, ms)); }

export default{
name:"superman",
aliases:["super","manofsteel"],
execute: async(sock,m)=>{
 // === RESTRICTED ===
 if(!m.isOwner){
  return await sock.sendMessage(m.chat,{
   text:`*⛔ ${toSC("quantum clearance required, owner only")}*`,
   footer: toSC("restricted"),
   buttons:[{buttonId:`.dev`, buttonText:{displayText:`👑 ${toSC("owner")}`}, type:1}],
   headerType:1
  },{quoted:m});
 }

 let sent = await sock.sendMessage(m.chat,{text:`*🦸 ${toSC("superman mode activating")}...*\n> ${toSC("wearing costume")}...`},{quoted:m});

 await delay(2000);
 await sock.sendMessage(m.chat,{text:`*✈️ ${toSC("trying to fly")}...*\n> ${toSC("status")}: true`, edit: sent.key},{quoted:m});

 await delay(2500);
 await sock.sendMessage(m.chat,{text:`*💪 ${toSC("lifting car")}...*\n> ${toSC("strength")}: true`, edit: sent.key},{quoted:m});

 await delay(2000);
 await sock.sendMessage(m.chat,{text:`*👀 ${toSC("laser eyes")}...*\n> ${toSC("power")}: true`, edit: sent.key},{quoted:m});

 await delay(1500);

 let txt = `*❌ ${toSC("superman failed")}*\n\n*${toSC("hero")}:* true\n*${toSC("fly")}:* true\n*${toSC("powers")}:* false\n*${toSC("cape")}:* true\n\n> ${toSC(" ")}\n> ${toSC(" ")}`;

 return await sock.sendMessage(m.chat,{text: txt},{quoted:m});
}
}
