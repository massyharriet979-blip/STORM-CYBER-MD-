function sc(t){const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return t.toLowerCase().split('').map(c=>m[c]||c).join('')}
let g={}
export default {
name:"drift",
execute: async(sock,m,args)=>{
 if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner) return sock.sendMessage(m.chat,{text:`${sc("restricted")}\n\n${sc("quantum clearance required, owner only")}`},{quoted:m})
 let chat=m.chat,act=args[0]||"start"; if(!g[chat]) g[chat]={angle:0,score:0,speed:0}; let r=g[chat]
 if(act==="start"){r.angle=0;r.score=0;r.speed=30}
 if(act==="accelerate") r.speed+=20,r.score+=10
 if(act==="left") r.angle-=20,r.score+=r.speed
 if(act==="right") r.angle+=20,r.score+=r.speed
 if(act==="handbrake") r.angle+=45,r.score+=50,r.speed=Math.max(20,r.speed-10)
 if(r.score>=1000){delete g[chat]; return sock.sendMessage(m.chat,{text:`🏆 ${sc(`drift king! score ${r.score}`)}`},{quoted:m})}
 await sock.sendMessage(m.chat,{text:`💫 ᴅʀɪғᴛ\n📐 ${sc(`angle: ${r.angle}°`)}\n⭐ ${sc(`score: ${r.score}`)}\n💨 ${sc(`speed: ${r.speed}`)}`,
 buttons:[{buttonId:".drift accelerate",buttonText:{displayText:"🏎️ GAS"},type:1},{buttonId:".drift left",buttonText:{displayText:"⬅️ LEFT"},type:1},{buttonId:".drift right",buttonText:{displayText:"RIGHT ➡️"},type:1},{buttonId:".drift handbrake",buttonText:{displayText:"🅿️ HANDBRAKE"},type:1}],headerType:1},{quoted:m})
}}
