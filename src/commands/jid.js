function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"jid",
aliases:["getjid"],
execute: async(sock,m,args)=>{
 if(m.isGroup){
  let meta=await sock.groupMetadata(m.chat);
  let isAdmin=meta.participants.find(p=>p.id===m.sender)?.admin;
  if(!m.isOwner &&!isAdmin) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("quantum clearance required, only admins are allowed to use this command")}`},{quoted:m});
 }

 await sock.sendMessage(m.chat,{react:{text:"🆔",key:m.key}});

 let jids=[];

 if(m.quoted){
  let q=m.quoted;
  jids.push(`📌 ${toSC("quoted user")}: ${q.sender}`);
  if(q.chat && q.chat.endsWith('@newsletter')) jids.push(`📢 ${toSC("newsletter jid")}: ${q.chat}`);
  if(q.key?.remoteJid) jids.push(`💬 ${toSC("remote jid")}: ${q.key.remoteJid}`);
 }

 if(m.mentionedJid && m.mentionedJid.length){
  for(let j of m.mentionedJid){
   jids.push(`👤 ${toSC("mentioned")}: ${j}`);
  }
 }

 if(jids.length===0){
  jids.push(`👤 ${toSC("your jid")}: ${m.sender}`);
  jids.push(`💬 ${toSC("chat jid")}: ${m.chat}`);
  if(m.isGroup){
   let meta=await sock.groupMetadata(m.chat).catch(()=>null);
   if(meta) jids.push(`👥 ${toSC("group name")}: ${meta.subject}`);
  }
  if(args[0] && args[0].includes('@')){
   jids.push(`🔗 ${toSC("input jid")}: ${args[0]}`);
  }
 }

 let txt=jids.join('\n\n');
 txt+=`\n\n> ${toSC("powered by storm cyber md")}`;

 await sock.sendMessage(m.chat,{text:txt},{quoted:m});
}
}
