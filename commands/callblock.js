import fs from 'fs';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

function getDB(botNumber){
 let p = `./database/callblock_${botNumber}.json`;
 if(!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify({enabled:false, msg:""}));
 return p;
}

export default{
name:"callblock",
aliases:["anticall","call"],
execute: async(sock,m,args)=>{
 // RESTRICTED
 if(!m.isOwner){
  return await sock.sendMessage(m.chat,{
   text:`*⛔ ${toSC("quantum clearance required, owner only")}*`,
   footer: toSC("restricted command"),
   buttons:[
    {buttonId:`.dev`, buttonText:{displayText:`👑 ${toSC("owner")}`}, type:1}
   ],
   headerType:1
  },{quoted:m});
 }

 let dbPath = getDB(m.botNumber);
 let data = JSON.parse(fs.readFileSync(dbPath));
 let opt = args[0]?.toLowerCase();

 if(!opt){
  return await sock.sendMessage(m.chat,{
   text:`*📵 ${toSC("callblock menu")}*\n\n*${toSC("status")}:* ${data.enabled? `✅ ${toSC("on")}` : `❌ ${toSC("off")}`}\n\n${toSC("use")}:.callblock on/off`,
   footer: toSC("storm callblock"),
   buttons:[
    {buttonId:`.callblock on`, buttonText:{displayText:`✅ ${toSC("on")}`}, type:1},
    {buttonId:`.callblock off`, buttonText:{displayText:`❌ ${toSC("off")}`}, type:1},
   ],
   headerType:1
  },{quoted:m});
 }

 if(opt==="on"){
  data.enabled = true;
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  return await sock.sendMessage(m.chat,{text:`*✅ ${toSC("callblock enabled")}*`},{quoted:m});
 }

 if(opt==="off"){
  data.enabled = false;
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("callblock disabled")}*`},{quoted:m});
 }
}
}
