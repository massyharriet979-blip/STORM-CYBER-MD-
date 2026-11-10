function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"follow",
aliases:["followchannel","fchannel"],
execute: async(sock,m,args)=>{
 try{
  const isOwner = m.isOwner || global.owner?.some(o=>m.sender.includes(o));
  const isBotItself = m.sender.includes(sock.user.id.split(':')[0]);
  // OWNER OR SUBBOT YES - SUDO ADMIN LOCAL NO
  if(!isOwner &&!isBotItself){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.follow channel link or id")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🔔",key:m.key}});

  let input = args[0];
  let id = input.split('/').pop().split('?')[0];

  let jid;
  try{
   let meta = await sock.newsletterMetadata("invite", id).catch(()=>sock.newsletterMetadata("jid", id));
   jid = meta.id;
  }catch{
   jid = id.includes("@newsletter")?id:id+"@newsletter";
  }

  await sock.newsletterFollow(jid);

  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
  await sock.sendMessage(m.chat,{text:`${toSC("followed channel")} ${id}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("failed to follow channel")}`},{quoted:m});
 }
}
}
