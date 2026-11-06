import fs from 'fs';

function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const FILE = './src/database/pmylock.json';

function load(){
 try{ if(!fs.existsSync(FILE)) return {enabled:false}; return JSON.parse(fs.readFileSync(FILE)); }catch{ return {enabled:false}; }
}
function save(d){ fs.mkdirSync('./src/database',{recursive:true}); fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }

export default{
name:"pmylock",
aliases:["pmlock","lockpm","pmblock"],
execute: async(sock,m,args)=>{
 if(!m.isOwner){
  return await sock.sendMessage(m.chat,{text:`*⛔ ${toSC("owner only")}*`},{quoted:m});
 }

 let data = load();
 let action = args[0]?.toLowerCase();

 if(!action){
  let txt = `*🔒 ${toSC("pmylock menu")}*\n\n*${toSC("status")}:* ${data.enabled? `✅ ${toSC("locked")}` : `❌ ${toSC("unlocked")}`}\n\n.pmylock on - ${toSC("lock pm")}\n.pmylock off - ${toSC("unlock pm")}\n\n> ${toSC("when locked only owner can use bot in pm")}`;
  return await sock.sendMessage(m.chat,{
   text: txt,
   footer: toSC("storm lock"),
   buttons:[
    {buttonId:`.pmylock ${data.enabled? 'off' : 'on'}`, buttonText:{displayText:`${data.enabled? `🔓 ${toSC("unlock")}` : `🔒 ${toSC("lock")}`}`}, type:1},
   ],
   headerType:1
  },{quoted:m});
 }

 if(action === "on" || action === "enable" || action === "lock"){
  data.enabled = true;
  save(data);
  return await sock.sendMessage(m.chat,{text:`*🔒 ${toSC("pm locked")}*\n> ${toSC("now only owner can use bot in pm")}*`},{quoted:m});
 }

 if(action === "off" || action === "disable" || action === "unlock"){
  data.enabled = false;
  save(data);
  return await sock.sendMessage(m.chat,{text:`*🔓 ${toSC("pm unlocked")}*\n> ${toSC("now everyone can use bot in pm")}*`},{quoted:m});
 }
}
}
