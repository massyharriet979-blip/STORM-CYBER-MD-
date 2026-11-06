function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"unshort",
aliases:["expandurl","unshorten","revealurl"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.unshort shorturl")}\n${toSC("ex:.unshort https://bit.ly/xyz")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🔗",key:m.key}});

  let short = args[0];
  if(!short.startsWith('http')) short = 'https://'+short;

  let res = await fetch(short,{method:'HEAD',redirect:'manual'});
  let finalUrl = res.headers.get('location') || short;

  if(!res.headers.get('location')){
   let res2 = await fetch(short,{redirect:'follow'});
   finalUrl = res2.url;
  }

  await new Promise(r=>setTimeout(r,400));

  let txt = `*${toSC("unshort complete")}* 🔓\n\n`+
  `${toSC("short")}: ${short}\n`+
  `${toSC("original")}: ${finalUrl}\n`+
  `${toSC("safe")}: ${finalUrl.startsWith('https')?toSC('yes https'):toSC('no http only')}\n\n`+
  `> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("unshort failed")}`},{quoted:m});
 }
}
}
