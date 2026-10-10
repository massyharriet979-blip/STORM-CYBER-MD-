function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"send",
aliases:["snd","sendto"],
execute: async(sock,m,args)=>{
 try{
  const isSudo = m.isSudo || m.isOwner || global.owner?.some(o=>m.sender.includes(o));
  const isBotItself = m.sender.includes(sock.user.id.split(':')[0]);
  if(!isSudo &&!isBotItself){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage")}:.send 255xxxx ${toSC("your message")}`},{quoted:m});
  }

  let jid = args[0].replace(/[^0-9]/g,'')+"@s.whatsapp.net";
  let text = args.slice(1).join(" ");
  if(!text){
   return await sock.sendMessage(m.chat,{text:`${toSC("give message to send")}`},{quoted:m});
  }

  let finalText = toSC(text);

  await sock.sendMessage(jid,{text:finalText});
  await sock.sendMessage(m.chat,{text:`${toSC("sent to")} ${args[0]}: ${finalText}`},{quoted:m});

 }catch(e){
  await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
 }
}
}
