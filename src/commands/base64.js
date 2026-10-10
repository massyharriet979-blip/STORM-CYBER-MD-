function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"base64",
aliases:["b64","encode64","decode64"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.base64 text")}\n${toSC("ex:.base64 hello")}\n${toSC("ex:.base64 decode aGVsbG8=")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🔐",key:m.key}});

  let result = "";
  if(args[0].toLowerCase() === 'decode'){
   let b64 = args.slice(1).join(" ");
   result = Buffer.from(b64,'base64').toString('utf-8');
  } else {
   let text = args.join(" ");
   result = Buffer.from(text).toString('base64');
  }

  await new Promise(r=>setTimeout(r,300));

  let txt = `*${toSC("base64 engine")}* 🧬\n\n${result.slice(0,3500)}\n\n> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("base64 error - invalid data")}`},{quoted:m});
 }
}
}
