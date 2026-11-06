function sc(t){const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return t.toLowerCase().split('').map(c=>m[c]||c).join('')}
let g={}
export default {
name:"boatrace",
execute: async(sock,m,args)=>{
 if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner) return sock.sendMessage(m.chat,{text:`${sc("restricted")}\n\n${sc("quantum clearance required, owner only")}`},{quoted:m})
 let chat=m.chat,act=args[0]||"start"; if(!g[chat]) g[chat]={speed:0,dist:0,wave:0}; let r=g[chat]
 if(act==="start"){r.speed=20;r.dist=0}
 if(act==="accelerate") r.speed=Math.min(180,r.speed+20),r.dist+=r.speed
 if(act==="left") r.wave--,r.dist+=r.speed
 if(act==="right") r.wave++,r.dist+=r.speed
 if(act==="boost") r.speed+=30,r.dist+=r.speed
 if(r.dist>=2000){delete g[chat]; return sock.sendMessage(m.chat,{text:`🏆 ${sc("boat race champion")}`},{quoted:m})}
 await sock.sendMessage(m.chat,{text:`🚤 ʙᴏᴀᴛ\n🌊 ${sc(`wave: ${r.wave}`)}\n💨 ${sc(`speed: ${r.speed} knots`)}\n📏 ${sc(`${r.dist}/2000m`)}`,
 buttons:[{buttonId:".boatrace accelerate",buttonText:{displayText:"🚤 GAS"},type:1},{buttonId:".boatrace left",buttonText:{displayText:"⬅️ LEFT"},type:1},{buttonId:".boatrace right",buttonText:{displayText:"RIGHT ➡️"},type:1},{buttonId:".boatrace boost",buttonText:{displayText:"💨 BOOST"},type:1}],headerType:1},{quoted:m})
}}
