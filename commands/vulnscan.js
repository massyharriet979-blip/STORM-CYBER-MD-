function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"vulnscan",
aliases:["vscan","vulncheck","securityscan"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.vulnscan url")}\n${toSC("ex:.vulnscan https://example.com")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🛡️",key:m.key}});

  let url = args[0];
  if(!url.startsWith('http')) url = 'https://'+url;

  let res = await fetch(url);
  let h = {};
  res.headers.forEach((v,k)=>h[k.toLowerCase()]=v);

  let vulns = [];
  let safe = [];

  if(!h['strict-transport-security']) vulns.push('Missing HSTS - MITM Risk');
  else safe.push('HSTS Enabled');

  if(!h['content-security-policy']) vulns.push('Missing CSP - XSS Possible');
  else safe.push('CSP Present');

  if(!h['x-frame-options']) vulns.push('Missing X-Frame-Options - Clickjack Risk');
  else safe.push('Clickjack Protected');

  if(!h['x-content-type-options']) vulns.push('Missing X-Content-Type-Options - MIME Sniff');
  else safe.push('MIME Protection On');

  if(h['server']) vulns.push(`Server Disclosure: ${h['server']}`);

  if(h['x-powered-by']) vulns.push(`Tech Leak: ${h['x-powered-by']}`);

  if(res.headers.get('set-cookie') &&!res.headers.get('set-cookie').includes('Secure')) vulns.push('Cookie without Secure flag');

  let score = Math.max(0, 100 - (vulns.length * 15));

  await new Promise(r=>setTimeout(r,600));

  let txt = `*${toSC("vulnscan report")}* 🔐\n\n`+
  `${toSC("target")}: ${url}\n`+
  `${toSC("status")}: ${res.status}\n`+
  `${toSC("security score")}: ${score}/100\n\n`+
  `${toSC("vulnerabilities")} [${vulns.length}]:\n${vulns.length? vulns.map(v=>`• ⚠️ ${v}`).join('\n') : `• ${toSC("none found")}`}\n\n`+
  `${toSC("protections")} [${safe.length}]:\n${safe.map(s=>`• ✅ ${s}`).join('\n')}\n\n`+
  `> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("scan failed")}: ${e.message.slice(0,80)}`},{quoted:m});
 }
}
}
