function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"binary",
aliases:["bin","tobinary","frombinary"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.binary text")}\n${toSC("ex:.binary hello")}\n${toSC("ex:.binary decode 01101000")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"💾",key:m.key}});

  let result = "";
  if(args[0].toLowerCase() === 'decode'){
   let bin = args.slice(1).join(" ");
   result = bin.split(" ").map(b=>String.fromCharCode(parseInt(b,2))).join("");
  } else {
   let text = args.join(" ");
   result = text.split("").map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(" ");
  }

  await new Promise(r=>setTimeout(r,300));

  let txt = `*${toSC("binary engine")}* ⚙️\n\n${result.slice(0,3500)}\n\n> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("binary error")}`},{quoted:m});
 }
}
}
