function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"locate",
aliases:["trace","location","find"],
execute: async(sock,m,args)=>{
 try{
  const isOwner = m.isOwner || m.sender.includes(sock.user.id.split(':')[0]) || global.owner?.some(o=>m.sender.includes(o));
  if(!isOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"📡",key:m.key}});

  let target;
  if(m.quoted) target = m.quoted.sender;
  else if(args[0]) target = args[0].replace(/[^0-9]/g,'')+"@s.whatsapp.net";
  else return await sock.sendMessage(m.chat,{text:`${toSC("usage:.locate number or reply to user")}\n${toSC("ex:.locate 2567xxxxxxx")}`},{quoted:m});

  let pp;
  try{ pp = await sock.profilePictureUrl(target,"image"); }catch{ pp = null; }

  let bio = await sock.fetchStatus(target).catch(()=>null);
  let num = target.split('@')[0];

  await new Promise(r=>setTimeout(r,800));

  await sock.sendMessage(m.chat,{
   text:`*${toSC("target located")}* 📍\n\n`+
   `${toSC("number")}: +${num}\n`+
   `${toSC("jid")}: ${target}\n`+
   `${toSC("bio")}: ${bio?.status||toSC("no bio")}\n`+
   `${toSC("status")}: ${toSC("trace complete")}\n\n`+
   `> ${toSC("powered by storm cyber md")}`,
  ...(pp?{contextInfo:{externalAdReply:{title:toSC("locate intel"),body:num,thumbnailUrl:pp,mediaType:1}}} : {})
  },{quoted:m});

  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("locate failed")}`},{quoted:m});
 }
}
}
