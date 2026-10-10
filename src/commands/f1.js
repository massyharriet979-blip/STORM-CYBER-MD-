function sc(t){const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return t.toLowerCase().split('').map(c=>m[c]||c).join('')}
let g={}
export default {
name:"f1",
execute: async(sock,m,args)=>{
 if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner) return sock.sendMessage(m.chat,{text:`${sc("restricted")}\n\n${sc("quantum clearance required, owner only")}`},{quoted:m})
 let chat=m.chat,act=args[0]||"start"; if(!g[chat]) g[chat]={speed:0,drs:false,dist:0}; let r=g[chat]
 if(act==="start"){r.speed=50;r.dist=0}
 if(act==="accelerate") r.speed=Math.min(380,r.speed+60),r.dist+=r.speed
 if(act==="brake") r.speed=Math.max(0,r.speed-70),r.dist+=r.speed/2
 if(act==="drs") r.drs=!r.drs, r.speed+= r.drs?40:-20, r.dist+=r.speed
 if(act==="pit") r.speed=0
 if(r.dist>=3000){delete g[chat]; return sock.sendMessage(m.chat,{text:`🏁 ${sc("f1 race won! podium")}`},{quoted:m})}
 await sock.sendMessage(m.chat,{text:`🏎️ ғ1 2024\n🚀 ${sc(`speed: ${r.speed} km/h ${r.drs?"drs on":""}`)}\n📏 ${sc(`${r.dist}/3000m`)}`,
 buttons:[{buttonId:".f1 accelerate",buttonText:{displayText:"🏎️ ACCELERATE"},type:1},{buttonId:".f1 brake",buttonText:{displayText:"🛑 BRAKE"},type:1},{buttonId:".f1 drs",buttonText:{displayText:"💨 DRS"},type:1},{buttonId:".f1 pit",buttonText:{displayText:"🔧 PIT"},type:1}],headerType:1},{quoted:m})
}}
