import fs from 'fs';
import { makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"jadibot",
aliases:["subbot","pairwa","rentbot","becomesub"],
execute: async(sock,m,args)=>{
 try{
  // === QUANTUM CHECK - MAIN BOT USERS CAN USE JADIBOT ===
  // Anyone can become subbot, but subbot becomes owner of his own

  let phone = args[0]?.replace(/[^0-9]/g,'') || m.sender.split('@')[0];
  if(phone.length < 10){
   return await sock.sendMessage(m.chat,{text:`*${toSC("example")}:*.jadibot 2557xxxxxxx\n${toSC("or just")}.jadibot ${toSC("to use your number")}`},{quoted:m});
  }

  const sessionPath = `./sessions/${phone}`;
  if(!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath,{recursive:true});

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  await sock.sendMessage(m.chat,{react:{text:"🔑",key:m.key}});

  const tempSock = makeWASocket({
   version,
   logger:pino({level:"silent"}),
   auth:{creds:state.creds, keys:makeCacheableSignalKeyStore(state.keys, pino({level:"silent"}))},
   browser:Browsers.ubuntu('Chrome'),
   printQRInTerminal:false
  });

  tempSock.ev.on('creds.update', saveCreds);

  if(!state.creds.registered){
   await new Promise(r=>setTimeout(r,2000));
   try{
    let code = await tempSock.requestPairingCode(phone);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    await sock.sendMessage(m.chat,{text:`*🔑 ${toSC("pairing code for subbot")}*\n\n*${toSC("number")}:* ${phone}\n*${toSC("code")}:* ${code}\n\n${toSC("go to whatsapp > linked devices > link with phone number > paste code")}\n\n*${toSC("after pairing, you will have unlimited access - all commands unlocked")}*\n\n> ${toSC("expires in 60s")}`},{quoted:m});
   }catch(e){
    await sock.sendMessage(m.chat,{text:`*${toSC("failed to get code")}*: ${e.message}\n${toSC("try again in 30s")}`},{quoted:m});
    try{ fs.rmSync(sessionPath,{recursive:true,force:true}) }catch{}
   }
  }else{
   await sock.sendMessage(m.chat,{text:`*✅ ${phone} ${toSC("already paired")}*\n${toSC("starting as subbot...")}`},{quoted:m});
   // trigger restart of subbot via global
   if(global.startSubBotSession) global.startSubBotSession(phone);
  }

  tempSock.ev.on('connection.update', async (u)=>{
   if(u.connection === 'open'){
    await sock.sendMessage(m.chat,{text:`*✅ SUBBOT ${phone} CONNECTED*\n*${toSC("you are now owner - no limits")}*\n\n${toSC("try")}.ghostmode on`},{quoted:m});
    if(global.startSubBotSession) global.startSubBotSession(phone);
   }
  });

 }catch(e){
  console.log(e);
  await sock.sendMessage(m.chat,{text:`Error: ${e.message}`},{quoted:m});
 }
}
}
