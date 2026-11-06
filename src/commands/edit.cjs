function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"edit",
aliases:["ed"],
execute: async(sock,m,args)=>{
 try{
  const isSudo = m.isSudo || m.isOwner || global.owner?.some(o=>m.sender.includes(o));
  const isBotItself = m.sender.includes(sock.user.id.split(':')[0]);
  if(!isSudo &&!isBotItself){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }
  let ctx=m.message?.extendedTextMessage?.contextInfo;
  if(!ctx?.stanzaId){
   return await sock.sendMessage(m.chat,{text:`${toSC("reply to bot message to edit")}`},{quoted:m});
  }
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("give text to edit")}`},{quoted:m});
  }
  let newText=toSC(args.join(" "));
  try{
   await sock.sendMessage(m.chat,{
    text:newText,
    edit:{remoteJid:m.chat, fromMe:true, id:ctx.stanzaId}
   });
  }catch{
   await sock.sendMessage(m.chat,{delete:{remoteJid:m.chat, fromMe:true, id:ctx.stanzaId}});
   await sock.sendMessage(m.chat,{text:newText});
  }
 }catch(e){
  await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
 }
}
}
