import fs from 'fs';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"togstatus",
aliases:["autostatus","togglestatus","statusview"],
execute: async(sock,m,args)=>{
 if(!m.isOwner) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("owner only")}`},{quoted:m});
 await sock.sendMessage(m.chat,{react:{text:"👁️",key:m.key}});

 let botId=m.botNumber || sock.user.id.split(':')[0];
 let file=`./database/config_${botId}.json`;
 let cfg={};
 try{
  if(fs.existsSync(file)) cfg=JSON.parse(fs.readFileSync(file));
 }catch{}

 let current=cfg.autoStatusView || false;
 let next=!current;
 cfg.autoStatusView=next;
 fs.mkdirSync('./database',{recursive:true});
 fs.writeFileSync(file, JSON.stringify(cfg,null,2));

 if(global.botConfig) global.botConfig.autoStatusView=next;
 if(global.saveConfig) global.saveConfig(botId, {autoStatusView:next});

 await sock.sendMessage(m.chat,{text:`${next?'✅':'❌'} ${toSC("auto status view")} ${next? toSC("enabled") : toSC("disabled")}\n\n> STORM CYBER MD`});
}
}
