function sc(t){const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return t.toLowerCase().split('').map(c=>m[c]||c).join('')}
let g={}
export default {
name:"jet",
execute: async(sock,m,args)=>{
 if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner) return sock.sendMessage(m.chat,{text:`${sc("restricted")}\n\n${sc("quantum clearance required, owner only")}`},{quoted:m})
 let chat=m.chat,act=args[0]||"start"; if(!g[chat]) g[chat]={alt:1000,speed:300,dist:0}; let r=g[chat]
 if(act==="start"){r.alt=1000;r.speed=300;r.dist=0}
 if(act==="up") r.alt+=500,r.dist+=r.speed
 if(act==="down") r.alt=Math.max(100,r.alt-500),r.dist+=r.speed
 if(act==="afterburner") r.speed+=200,r.dist+=r.speed
 if(act==="brake") r.speed=Math.max(200,r.speed-100),r.dist+=r.speed
 if(r.dist>=5000){delete g[chat]; return sock.sendMessage(m.chat,{text:`✈️ ${sc("jet mission complete!")}`},{quoted:m})}
 await sock.sendMessage(m.chat,{text:`✈️ ᴊᴇᴛ ғɪɢʜᴛᴇʀ\n📈 ${sc(`alt: ${r.alt} ft`)}\n💨 ${sc(`speed: ${r.speed}`)}\n📏 ${sc(`${r.dist}/5000m`)}`,
 buttons:[{buttonId:".jet up",buttonText:{displayText:"⬆️ PULL UP"},type:1},{buttonId:".jet down",buttonText:{displayText:"⬇️ DIVE"},type:1},{buttonId:".jet afterburner",buttonText:{displayText:"🔥 AFTERBURNER"},type:1},{buttonId:".jet brake",buttonText:{displayText:"🛑 AIRBRAKE"},type:1}],headerType:1},{quoted:m})
}}
