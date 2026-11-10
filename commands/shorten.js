function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"shorten",
aliases:["short","shorturl","tiny"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0] ||!args[0].startsWith("http")){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.shorten https://example.com")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🔗",key:m.key}});

  let longUrl = args[0];
  let api = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;

  let res = await fetch(api);
  let shortUrl = await res.text();

  if(!shortUrl.startsWith("http")){
   shortUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`;
   let res2 = await fetch(shortUrl);
   shortUrl = await res2.text();
  }

  await new Promise(r=>setTimeout(r,400));

  let txt = `*${toSC("shorten engine")}* ✂️\n\n${toSC("original")}: ${longUrl}\n${toSC("short")}: ${shortUrl}\n${toSC("status")}: COMPRESSED ✓\n\n> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("shorten error - invalid url")}`},{quoted:m});
 }
}
}
