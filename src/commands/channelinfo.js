function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"channelinfo",
aliases:["cinfo","chinfo","newsletterinfo"],
execute: async(sock,m,args)=>{
 try{
  const isSudo = m.isSudo || m.isOwner || global.owner?.some(o=>m.sender.includes(o));
  const isBotItself = m.sender.includes(sock.user.id.split(':')[0]);
  if(!isSudo &&!isBotItself){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.channelinfo channel link or id")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🔍",key:m.key}});

  let input = args[0];
  let id = input.split('/').pop().split('?')[0];

  let meta;
  try{
   meta = await sock.newsletterMetadata("jid", id).catch(async()=>{
    return await sock.newsletterMetadata("invite", id);
   });
  }catch{
   meta = await sock.newsletterMetadata("invite", id);
  }

  if(!meta){
   return await sock.sendMessage(m.chat,{text:`${toSC("failed to fetch channel")}`},{quoted:m});
  }

  let txt = `${toSC("channel info")}:\n\n`+
  `${toSC("name")}: ${meta.name}\n`+
  `${toSC("id")}: ${meta.id}\n`+
  `${toSC("followers")}: ${meta.subscribers||meta.followers||"unknown"}\n`+
  `${toSC("state")}: ${meta.state||"active"}\n`+
  `${toSC("verified")}: ${meta.verification=="VERIFIED"?toSC("yes"):toSC("no")}\n`+
  `${toSC("desc")}: ${meta.description?toSC(meta.description.slice(0,300)):"-"}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("error")}: ${e.message?toSC(e.message.slice(0,100)):toSC("failed")}`},{quoted:m});
 }
}
}
