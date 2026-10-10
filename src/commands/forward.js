function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"forward",
aliases:["fwd"],
execute: async(sock,m,args)=>{
 try{
  const isSudo = m.isSudo || m.isOwner || global.owner?.some(o=>m.sender.includes(o));
  const isBotItself = m.sender.includes(sock.user.id.split(':')[0]);
  if(!isSudo &&!isBotItself){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  let ctx=m.message?.extendedTextMessage?.contextInfo;
  if(!ctx?.quotedMessage){
   return await sock.sendMessage(m.chat,{text:`${toSC("reply to a message to forward")}`},{quoted:m});
  }
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.forward 255xxxx")}`},{quoted:m});
  }

  let jid = args[0].replace(/[^0-9]/g,'')+"@s.whatsapp.net";
  let msg = {
    message: ctx.quotedMessage,
    key: { remoteJid: m.chat, fromMe: false, id: ctx.stanzaId, participant: ctx.participant }
  };

  await sock.sendMessage(jid,{forward: msg});
  await sock.sendMessage(m.chat,{text:`${toSC("forwarded to")} ${args[0]}`},{quoted:m});

 }catch{
  await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
 }
}
}
