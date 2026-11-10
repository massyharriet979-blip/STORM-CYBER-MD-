function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"channel-icon",
aliases:["c-icon","ch-icon","channelicon","channelpp"],
execute: async(sock,m,args)=>{
 try{
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.channel-icon channel link or id")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🖼️",key:m.key}});

  let input = args[0];
  let id = input.split('/').pop().split('?')[0];

  let meta, jid;
  try{
   meta = await sock.newsletterMetadata("invite", id).catch(()=>sock.newsletterMetadata("jid", id));
   jid = meta.id;
  }catch{
   jid = id.includes("@newsletter")?id:id+"@newsletter";
   meta = await sock.newsletterMetadata("jid", jid).catch(()=>null);
  }

  let ppUrl;
  try{
   ppUrl = await sock.profilePictureUrl(jid, "image");
  }catch{
   ppUrl = meta?.picture || meta?.preview || null;
  }

  if(!ppUrl){
   return await sock.sendMessage(m.chat,{text:`${toSC("no icon found for this channel")}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{
   image:{url:ppUrl},
   caption:`${toSC("channel icon fetched")}: ${meta?.name||id}\n\n> ${toSC("powered by storm cyber md")}`
  },{quoted:m});

  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("failed to fetch channel icon")}`},{quoted:m});
 }
}
}
