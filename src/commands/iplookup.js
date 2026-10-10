function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"iplookup",
aliases:["ipinfo","iptrace","ip"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.iplookup ip address")}\n${toSC("ex:.iplookup 8.8.8.8")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🌐",key:m.key}});

  let ip = args[0].trim();
  let res = await fetch(`http://ip-api.com/json/${ip}?fields=66846719`);
  let data = await res.json();

  if(data.status === 'fail'){
   return await sock.sendMessage(m.chat,{text:`${toSC("invalid ip or lookup failed")}`},{quoted:m});
  }

  await new Promise(r=>setTimeout(r,600));

  let txt = `*${toSC("ip trace complete")}* 📡\n\n`+
  `${toSC("ip")}: ${data.query}\n`+
  `${toSC("country")}: ${data.country} ${data.countryCode}\n`+
  `${toSC("region")}: ${data.regionName} - ${data.city}\n`+
  `${toSC("isp")}: ${data.isp}\n`+
  `${toSC("org")}: ${data.org}\n`+
  `${toSC("timezone")}: ${data.timezone}\n`+
  `${toSC("coords")}: ${data.lat}, ${data.lon}\n`+
  `${toSC("zip")}: ${data.zip}\n\n`+
  `> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("lookup error")}`},{quoted:m});
 }
}
}
