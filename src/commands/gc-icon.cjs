function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"gc-icon",
aliases:["groupicon","gcpp","gcicon"],
execute: async(sock,m,args)=>{
 try{
  if(!m.isGroup){
   return await sock.sendMessage(m.chat,{text:`${toSC("this command is for groups only")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🖼️",key:m.key}});

  let ppUrl;
  try{
   ppUrl = await sock.profilePictureUrl(m.chat, "image");
  }catch{
   return await sock.sendMessage(m.chat,{text:`${toSC("no icon found or failed to fetch")}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
  }

  if(!ppUrl){
   return await sock.sendMessage(m.chat,{text:`${toSC("group has no icon")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{
   image:{url:ppUrl},
   caption:`${toSC("group icon fetched")}\n\n> ${toSC("powered by storm cyber md")}`
  },{quoted:m});

  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("failed to fetch icon")}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
 }
}
}
