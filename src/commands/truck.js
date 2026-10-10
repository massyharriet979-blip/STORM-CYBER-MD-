function sc(t){const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return t.toLowerCase().split('').map(c=>m[c]||c).join('')}
let g={}
export default {
name:"truck",
execute: async(sock,m,args)=>{
 if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner) return sock.sendMessage(m.chat,{text:`${sc("restricted")}\n\n${sc("quantum clearance required, owner only")}`},{quoted:m})
 let chat=m.chat,act=args[0]||"start"; if(!g[chat]) g[chat]={speed:0,cargo:100,dist:0}; let r=g[chat]
 if(act==="start"){r.speed=10;r.dist=0;r.cargo=100}
 if(act==="accelerate") r.speed=Math.min(120,r.speed+15),r.dist+=r.speed
 if(act==="brake") r.speed=Math.max(0,r.speed-15),r.dist+=r.speed/2
 if(act==="horn") r.dist+=r.speed
 if(act==="cargo") r.cargo=Math.max(0,r.cargo-5),r.speed+=5
 if(r.dist>=2000){delete g[chat]; return sock.sendMessage(m.chat,{text:`🚚 ${sc(`delivery complete! cargo ${r.cargo}%`)}`},{quoted:m})}
 await sock.sendMessage(m.chat,{text:`🚚 ᴛʀᴜᴄᴋ\n💨 ${sc(`speed: ${r.speed}`)}\n📦 ${sc(`cargo: ${r.cargo}%`)}\n📏 ${sc(`${r.dist}/2000m`)}`,
 buttons:[{buttonId:".truck accelerate",buttonText:{displayText:"🚚 GAS"},type:1},{buttonId:".truck brake",buttonText:{displayText:"🛑 BRAKE"},type:1},{buttonId:".truck horn",buttonText:{displayText:"📢 HORN"},type:1},{buttonId:".truck cargo",buttonText:{displayText:"📦 DROP CARGO"},type:1}],headerType:1},{quoted:m})
}}
