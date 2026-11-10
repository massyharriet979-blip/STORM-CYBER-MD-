import fs from 'fs';
function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}
const FILE = './src/database/status.json';
function load(){ try{ if(!fs.existsSync(FILE)) return {enabled:false}; return JSON.parse(fs.readFileSync(FILE)); }catch{ return {enabled:false}; } }
function save(d){ fs.mkdirSync('./src/database',{recursive:true}); fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }

export default{
name:"statussaver",
aliases:["ssaver","savestatus","status"],
execute: async(sock,m,args)=>{
 if(!m.isOwner) return await sock.sendMessage(m.chat,{text:`*⛔ ${toSC("owner only")}*`},{quoted:m});
 let data = load();
 let action = args[0]?.toLowerCase();

 if(!action){
  let txt = `*👁️ ${toSC("status saver")}*\n\n*${toSC("status")}:* ${data.enabled? `✅ ${toSC("on")}` : `❌ ${toSC("off")}`}\n\n.statussaver on - ${toSC("enable auto save")}\n.statussaver off - ${toSC("disable")}\n${toSC("reply to any status with")}.statussaver - ${toSC("to save manually")}`;
  return await sock.sendMessage(m.chat,{
   text: txt,
   footer: toSC("storm saver"),
   buttons:[{buttonId:`.statussaver ${data.enabled?'off':'on'}`, buttonText:{displayText:`${data.enabled?`❌ ${toSC("off")}`:`✅ ${toSC("on")}`}`}, type:1}],
   headerType:1
  },{quoted:m});
 }

 if(action === "on"){
  data.enabled = true; save(data);
  return await sock.sendMessage(m.chat,{text:`*✅ ${toSC("status saver enabled")}*`},{quoted:m});
 }
 if(action === "off"){
  data.enabled = false; save(data);
  return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("status saver disabled")}*`},{quoted:m});
 }

 // manual save when replying to status
 if(m.quoted){
  try{
   let q = await m.quoted.download?.() || await sock.downloadMediaMessage(m.quoted);
   if(!q) throw "no media";
   await sock.sendMessage(m.sender,{text:`*✅ ${toSC("status saved")}*`});
   return await sock.sendMessage(m.sender,{image:q, caption:`*${toSC("saved status from")}* @${m.quoted.sender?.split('@')[0]}`, mentions:[m.quoted.sender]},{quoted:m});
  }catch(e){
   return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("reply to a status")}*`},{quoted:m});
  }
 }
}
}
