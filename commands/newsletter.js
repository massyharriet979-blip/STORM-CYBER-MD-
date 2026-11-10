function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"newsletter",
aliases:["newslet","broadcast"],
execute: async(sock,m,args)=>{
 try{
  const isSudo = m.isSudo || m.isOwner || global.owner?.some(o=>m.sender.includes(o));
  const isBotItself = m.sender.includes(sock.user.id.split(':')[0]);
  if(!isSudo &&!isBotItself){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.newsletter your message")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"📢",key:m.key}});

  let text = toSC(args.join(" "));
  let groups = await sock.groupFetchAllParticipating().catch(()=>({}));
  let jids = Object.keys(groups);

  await sock.sendMessage(m.chat,{text:`${toSC("broadcasting to")} ${jids.length} ${toSC("groups with 2s delay")}`},{quoted:m});

  let sent = 0;
  for(let jid of jids){
   try{
    await sock.sendMessage(jid,{text:text});
    sent++;
    await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
   }catch{}
   await new Promise(r=>setTimeout(r,2000));
  }

  await sock.sendMessage(m.chat,{react:{text:"✔️",key:m.key}});
  await sock.sendMessage(m.chat,{text:`${toSC("done sent to")} ${sent}/${jids.length}`},{quoted:m});

 }catch{
  await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
 }
}
}
