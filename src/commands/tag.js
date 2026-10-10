function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"tag",
aliases:["tagall","hidetag"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});
 let meta=await sock.groupMetadata(m.chat);
 let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
 if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"📢",key:m.key}});

 let participants=meta.participants.map(p=>p.id);
 let text=args.join(' ');

 if(m.quoted){
  let q=m.quoted;
  // if user wrote custom text with tag, use that, else forward quoted text
  let qText=q.text || q.caption || '';
  let finalText = text? text : qText || toSC("attention everyone");
  await sock.sendMessage(m.chat,{text: finalText, mentions: participants});
 }else{
  if(!text) text=`${toSC("attention everyone")} @${meta.subject}`;
  await sock.sendMessage(m.chat,{text: text, mentions: participants});
 }
}
}
