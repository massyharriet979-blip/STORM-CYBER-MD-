function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

function delay(ms){ return new Promise(r=>setTimeout(r, ms)); }

export default{
name:"spamyug",
aliases:["spamyg","spamu","spamy"],
execute: async(sock,m,args)=>{
 // === RESTRICTED - OWNER ONLY ===
 if(!m.isOwner){
  return await sock.sendMessage(m.chat,{
   text:`*⛔ ${toSC("quantum clearance required, owner only")}*`,
   footer: toSC("restricted command"),
   buttons:[{buttonId:`.dev`, buttonText:{displayText:`👑 ${toSC("owner")}`}, type:1}],
   headerType:1
  },{quoted:m});
 }

 let amount = parseInt(args[0]) || 5;
 let sec = parseInt(args[1]) || 2;
 let text = args.slice(2).join(" ") || `${toSC("storm spam")}`;

 if(amount > 30) amount = 30;
 if(sec < 1) sec = 1;
 if(sec > 10) sec = 10;

 await sock.sendMessage(m.chat,{
  text:`*⚠️ ${toSC("spamyug started")}*\n\n*${toSC("count")}:* ${amount}\n*${toSC("delay")}:* ${sec}s\n*${toSC("text")}:* ${text}`,
  footer: toSC("storm spam"),
  buttons:[{buttonId:`.spamyug ${amount} ${sec} ${text}`, buttonText:{displayText:`🔁 ${toSC("again")}`}, type:1}],
  headerType:1
 },{quoted:m});

 for(let i=0;i<amount;i++){
  await delay(sec*1000);
  await sock.sendMessage(m.chat,{text:`${text} - ${i+1}/${amount}`});
 }

 await sock.sendMessage(m.chat,{text:`*✅ ${toSC("done")} ${amount}x*`},{quoted:m});
}
}
