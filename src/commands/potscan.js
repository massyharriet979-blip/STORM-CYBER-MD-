import net from 'net';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"potscan",
aliases:["portscan","pscan","scanport"],
execute: async(sock,m,args)=>{
 try{
  const botNumber = sock.user.id.split(':')[0].split('@')[0];
  const senderNumber = m.sender.split('@')[0];
  const isSubOwner = senderNumber === botNumber || m.isOwner;

  if(!isSubOwner){
   return await sock.sendMessage(m.chat,{text:"QUANTUM CLEARANCE REQUIRED, OWNER ONLY"},{quoted:m});
  }

  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.potscan host")}\n${toSC("ex:.potscan 8.8.8.8")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🔍",key:m.key}});

  let host = args[0].replace(/https?:\/\//,'').split('/')[0];
  let ports = [21,22,23,25,53,80,110,443,3000,3001,3306,4000,5000,8000,8080,8443,9000];

  let open = [];

  const scan = (p) => new Promise(res=>{
   let socket = new net.Socket();
   socket.setTimeout(1000);
   socket.on('connect',()=>{ open.push(p); socket.destroy(); res(); });
   socket.on('timeout',()=>{ socket.destroy(); res(); });
   socket.on('error',()=>{ socket.destroy(); res(); });
   socket.connect(p, host);
  });

  await Promise.all(ports.map(scan));

  await new Promise(r=>setTimeout(r,600));

  let txt = `*${toSC("potscan report")}* 🛰️\n\n`+
  `${toSC("host")}: ${host}\n`+
  `${toSC("scanned")}: ${ports.length} ${toSC("ports")}\n`+
  `${toSC("open")}: ${open.length?open.join(', '):toSC("none found")}\n\n`+
  `> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("scan failed")}`},{quoted:m});
 }
}
}
