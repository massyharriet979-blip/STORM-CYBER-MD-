import fs from 'fs';
function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}
const FILE = './src/database/premium.json';
function load(){ try{ if(!fs.existsSync(FILE)) return []; return JSON.parse(fs.readFileSync(FILE)); }catch{ return []; } }
function save(d){ fs.mkdirSync('./src/database',{recursive:true}); fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }

export default{
name:"premium",
aliases:["prem","vip","addprem"],
execute: async(sock,m,args)=>{
 if(!m.isOwner){
  return await sock.sendMessage(m.chat,{text:`*⛔ ${toSC("owner only")}*`},{quoted:m});
 }

 let list = load();
 let action = args[0]?.toLowerCase();
 let target = m.mentionedJid?.[0] || (args[1]?.replace(/[^0-9]/g,'')? args[1].replace(/[^0-9]/g,'')+'@s.whatsapp.net' : null) || m.quoted?.sender;

 if(!action){
  let txt = `*💎 ${toSC("premium menu")}*\n\n*${toSC("total premium")}:* ${list.length}\n\n.premium add @user - ${toSC("add premium")}\n.premium del @user - ${toSC("remove")}\n.premium list - ${toSC("show list")}\n\n> ${toSC("premium gets all vip commands")}`;
  return await sock.sendMessage(m.chat,{
   text: txt,
   footer: toSC("storm premium"),
   buttons:[
    {buttonId:`.premium list`, buttonText:{displayText:`📜 ${toSC("list")}`}, type:1},
    {buttonId:`.premium add`, buttonText:{displayText:`➕ ${toSC("add")}`}, type:1},
   ],
   headerType:1
  },{quoted:m});
 }

 if(action === "add" || action === "give"){
  if(!target) return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("tag user")}*`},{quoted:m});
  if(list.includes(target)) return await sock.sendMessage(m.chat,{text:`*⚠️ ${toSC("already premium")}* @${target.split('@')[0]}`, mentions:[target]},{quoted:m});
  list.push(target); save(list);
  return await sock.sendMessage(m.chat,{text:`*✅ ${toSC("added premium")}*\n> @${target.split('@')[0]} ${toSC("is now premium")}`, mentions:[target]},{quoted:m});
 }

 if(action === "del" || action === "remove" || action === "rem"){
  if(!target) return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("tag user")}*`},{quoted:m});
  list = list.filter(x=>x!==target); save(list);
  return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("removed premium")}*\n> @${target.split('@')[0]} ${toSC("no longer premium")}`, mentions:[target]},{quoted:m});
 }

 if(action === "list"){
  if(list.length===0) return await sock.sendMessage(m.chat,{text:`*📭 ${toSC("no premium users")}*`},{quoted:m});
  let txt = `*💎 ${toSC("premium users")} [${list.length}]*\n\n` + list.map((v,i)=>`${i+1}. @${v.split('@')[0]}`).join('\n');
  return await sock.sendMessage(m.chat,{text: txt, mentions:list},{quoted:m});
 }
}
}
