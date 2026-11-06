function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"webscan",
aliases:["scanweb","headerscan","webinfo"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.webscan url")}\n${toSC("ex:.webscan https://google.com")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🛰️",key:m.key}});

  let url = args[0];
  if(!url.startsWith('http')) url = 'https://'+url;
  let domain = url.replace(/https?:\/\//,'').split('/')[0];

  let start = Date.now();
  let res = await fetch(url,{method:'HEAD'}).catch(async()=>await fetch(url));
  let end = Date.now();

  let headers = {};
  res.headers.forEach((v,k)=>{ headers[k]=v; });

  await new Promise(r=>setTimeout(r,500));

  let txt = `*${toSC("webscan report")}* 🌐\n\n`+
  `${toSC("url")}: ${url}\n`+
  `${toSC("domain")}: ${domain}\n`+
  `${toSC("status")}: ${res.status} ${res.statusText}\n`+
  `${toSC("latency")}: ${end-start}ms\n`+
  `${toSC("server")}: ${headers['server']||'hidden'}\n`+
  `${toSC("powered")}: ${headers['x-powered-by']||'hidden'}\n`+
  `${toSC("cloudflare")}: ${headers['cf-ray']?'yes':'no'}\n`+
  `${toSC("content")}: ${headers['content-type']||'unknown'}\n`+
  `${toSC("hsts")}: ${headers['strict-transport-security']?'enabled':'disabled'}\n\n`+
  `${toSC("headers")}:\n${Object.entries(headers).slice(0,8).map(([k,v])=>`• ${k}: ${v.slice(0,80)}`).join('\n')}\n\n`+
  `> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("webscan failed")}: ${e.message.slice(0,100)}`},{quoted:m});
 }
}
}
