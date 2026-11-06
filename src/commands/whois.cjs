function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"whois",
aliases:["domaininfo","lookupdomain"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.whois domain.com")}\n${toSC("ex:.whois google.com")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🔎",key:m.key}});

  let domain = args[0].replace(/https?:\/\//,'').split('/')[0];

  let res = await fetch(`https://api.hacker-target.com/whois/?q=${domain}`);
  let text = await res.text();

  if(!text || text.toLowerCase().includes('error') || text.length < 20){
   return await sock.sendMessage(m.chat,{text:`${toSC("whois failed or private")}`},{quoted:m});
  }

  let clean = text.slice(0,3500);

  await new Promise(r=>setTimeout(r,600));

  let msg = `*${toSC("whois intel")}* 🌐\n\n`+
  `${toSC("domain")}: ${domain}\n\n`+
  `${clean}\n\n`+
  `> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:msg},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("whois error")}`},{quoted:m});
 }
}
}
