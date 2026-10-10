import crypto from 'crypto';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"hash",
aliases:["hashgen","hasher"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0] ||!args[1]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.hash type text")}\n${toSC("types:md5,sha1,sha256,sha512")}\n${toSC("ex:.hash md5 hello")}\n${toSC("ex:.hash sha256 storm")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"#️⃣",key:m.key}});

  let type = args[0].toLowerCase();
  let text = args.slice(1).join(" ");
  let allowed = ["md5","sha1","sha256","sha512"];

  if(!allowed.includes(type)){
   return await sock.sendMessage(m.chat,{text:`${toSC("invalid type - use md5/sha1/sha256/sha512")}`},{quoted:m});
  }

  let hash = crypto.createHash(type).update(text).digest('hex');

  await new Promise(r=>setTimeout(r,300));

  let txt = `*${toSC("hash engine")}* #️⃣\n\n${toSC("type")}: ${type.toUpperCase()}\n${toSC("input")}: ${text}\n${toSC("hash")}: ${hash}\n\n> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("hash error")}`},{quoted:m});
 }
}
}
