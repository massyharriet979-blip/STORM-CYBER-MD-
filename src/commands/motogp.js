function sc(t){const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return t.toLowerCase().split('').map(c=>m[c]||c).join('')}
let g={}
export default {
name:"motogp",alias:["bikerace","realbike","mxrace","trafficrider"],
execute: async(sock,m,args)=>{
 if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner) return sock.sendMessage(m.chat,{text:`${sc("restricted")}\n\n${sc("quantum clearance required, owner only")}`},{quoted:m})
 let chat=m.chat,act=args[0]||"start"; if(!g[chat]) g[chat]={speed:0,lean:0,dist:0}; let r=g[chat]
 if(act==="start"){r.speed=40;r.dist=0}
 if(act==="accelerate") r.speed=Math.min(310,r.speed+50),r.dist+=r.speed
 if(act==="brake") r.speed=Math.max(0,r.speed-60),r.dist+=r.speed/3
 if(act==="left") r.lean--,r.dist+=r.speed
 if(act==="right") r.lean++,r.dist+=r.speed
 if(act==="wheelie") r.speed+=20,r.dist+=r.speed+40
 if(r.dist>=2000){delete g[chat]; return sock.sendMessage(m.chat,{text:`🏆 ${sc("motogp champion!")}`},{quoted:m})}
 await sock.sendMessage(m.chat,{text:`🏍️ ᴍᴏᴛᴏ ɢᴘ\n💨 ${sc(`speed: ${r.speed} km/h`)}\n↔️ ${sc(`lean: ${r.lean}`)}\n📏 ${sc(`${r.dist}/2000m`)}`,
 buttons:[{buttonId:".motogp accelerate",buttonText:{displayText:"🏍️ THROTTLE"},type:1},{buttonId:".motogp brake",buttonText:{displayText:"🛑 BRAKE"},type:1},{buttonId:".motogp left",buttonText:{displayText:"⬅️ LEFT"},type:1},{buttonId:".motogp right",buttonText:{displayText:"RIGHT ➡️"},type:1},{buttonId:".motogp wheelie",buttonText:{displayText:"🔥 WHEELIE"},type:1}],headerType:1},{quoted:m})
}}
