function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"phishcheck",
aliases:["phish","checkphish","isphish"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }
  if(!args[0] ||!args[0].startsWith("http")){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.phishcheck https://example.com")}`},{quoted:m});
  }
  await sock.sendMessage(m.chat,{react:{text:"🎣",key:m.key}});
  let url = args[0];
  let score = 0;
  let flags = [];
  if(url.length > 75){score+=20; flags.push("Long URL");}
  if(url.includes("@")){score+=30; flags.push("Contains @");}
  if((url.match(/-/g)||[]).length>3){score+=15; flags.push("Many hyphens");}
  if(url.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)){score+=25; flags.push("IP based");}
  if(!url.startsWith("https://")){score+=10; flags.push("No HTTPS");}
  if(url.includes("login") && url.includes("verify")){score+=15; flags.push("Login keywords");}

  let status = score < 25? "SAFE ✓" : score < 60? "SUSPICIOUS ⚠️" : "PHISHING RISK ❌";
  let risk = score;

  await new Promise(r=>setTimeout(r,500));

  let txt = `*${toSC("phishcheck engine")}* 🛡️\n\n${toSC("url")}: ${url}\n${toSC("risk score")}: ${risk}/100\n${toSC("status")}: ${status}\n${toSC("flags")}: ${flags.length?flags.join(", "):"None"}\n${toSC("mode")}: LAB SIMULATION\n${toSC("advice")}: ${risk>50?toSC("do not open"):toSC("seems clean")}\n\n> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("phishcheck error")}`},{quoted:m});
 }
}
}
