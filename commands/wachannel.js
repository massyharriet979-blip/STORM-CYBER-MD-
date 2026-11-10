function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"wachannel",
aliases:["createchannel","newchannel","cchannel"],
execute: async(sock,m,args)=>{
 try{
  const isOwner = m.isOwner || global.owner?.some(o=>m.sender.includes(o));
  const isBotItself = m.sender.includes(sock.user.id.split(':')[0]);
  if(!isOwner &&!isBotItself){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.wachannel name | description")}\n${toSC("ex:.wachannel storm updates | official channel")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"✨",key:m.key}});

  let full = args.join(" ").split("|");
  let name = full[0].trim();
  let desc = full[1]?.trim()||"Powered by Storm Cyber MD";

  let result = await sock.newsletterCreate(name, desc);

  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
  await sock.sendMessage(m.chat,{text:
`${toSC("channel created")}:\n\n`+
`${toSC("name")}: ${result.name||name}\n`+
`${toSC("id")}: ${result.id}\n`+
`${toSC("invite")}: ${result.invite||`https://whatsapp.com/channel/${result.id.split('@')[0]}`}\n\n`+
`> ${toSC("powered by storm cyber md")}`
},{quoted:m});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("failed to create channel")}: ${e.message?.slice(0,120)}`},{quoted:m});
 }
}
}
