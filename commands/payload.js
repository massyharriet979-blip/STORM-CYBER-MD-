function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"payload",
aliases:["pld","genpayload"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.payload text")}\n${toSC("ex:.payload storm_lab")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"⚙️",key:m.key}});

  let input = args.join(" ");
  let hex = Buffer.from(input).toString('hex');
  let b64 = Buffer.from(input).toString('base64');
  let id = 'STORM-' + Math.random().toString(36).substring(2,8).toUpperCase();

  await new Promise(r=>setTimeout(r,1000));

  let txt = `*${toSC("payload engine")}* 💉\n\n`+
  `${toSC("id")}: ${id}\n`+
  `${toSC("input")}: ${input}\n`+
  `${toSC("mode")}: LAB SIMULATION\n`+
  `${toSC("hex")}: ${hex}\n`+
  `${toSC("base64")}: ${b64}\n`+
  `${toSC("size")}: ${Buffer.byteLength(input)} bytes\n`+
  `${toSC("status")}: GENERATED ✓\n\n`+
  `> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("payload error")}`},{quoted:m});
 }
}
}
