function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"lag",
aliases:["ping","speed","latency"],
execute: async(sock,m)=>{
 let start = Date.now();
 let msg = await sock.sendMessage(m.chat,{text:`*⏳ ${toSC("checking lag")}...*`},{quoted:m});
 let end = Date.now();
 let ping = end - start;

 let txt = `*📡 ${toSC("lag test")}*\n\n*${toSC("speed")}:* ${ping}ms\n*${toSC("status")}:* ${ping < 500? `⚡ ${toSC("fast")}` : ping < 1000? `✅ ${toSC("normal")}` : `🐢 ${toSC("slow")}`}\n\n> ${toSC("storm bot is active")}`;

 return await sock.sendMessage(m.chat,{
  text: txt,
  footer: toSC("storm latency"),
  buttons:[
   {buttonId:`.lag`, buttonText:{displayText:`🔄 ${toSC("again")}`}, type:1},
   {buttonId:`.ping`, buttonText:{displayText:`📡 ${toSC("ping")}`}, type:1},
  ],
  headerType:1,
  edit: msg.key
 },{quoted:m});
}
}
