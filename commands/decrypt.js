function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"decrypt",
aliases:["dec","decode"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;
  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0] ||!args[1]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.decrypt type data")}\n${toSC("types:base64,hex,binary")}\n${toSC("ex:.decrypt base64 aGVsbG8=")}\n${toSC("ex:.decrypt hex 68656c6c6f")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🔓",key:m.key}});

  let type = args[0].toLowerCase();
  let data = args.slice(1).join(" ");
  let result = "";

  if(type === "base64" || type === "b64"){
   result = Buffer.from(data,'base64').toString('utf-8');
  } else if(type === "hex"){
   result = Buffer.from(data,'hex').toString('utf-8');
  } else if(type === "binary" || type === "bin"){
   result = data.split(" ").map(b=>String.fromCharCode(parseInt(b,2))).join("");
  } else {
   return await sock.sendMessage(m.chat,{text:`${toSC("invalid type - use base64/hex/binary")}`},{quoted:m});
  }

  await new Promise(r=>setTimeout(r,300));

  let txt = `*${toSC("decrypt engine")}* 🔓\n\n${toSC("type")}: ${type}\n${toSC("result")}: ${result.slice(0,3500)}\n\n> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("decrypt error - invalid data")}`},{quoted:m});
 }
}
}
