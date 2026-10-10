function sc(t){const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return t.toLowerCase().split('').map(c=>m[c]||c).join('')}
let g={}
export default {
name:"asphalt",
execute: async(sock,m,args)=>{
 if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner) return sock.sendMessage(m.chat,{text:`${sc("restricted")}\n\n${sc("quantum clearance required, owner only")}`},{quoted:m})
 let chat=m.chat,act=args[0]||"start"; if(!g[chat]) g[chat]={speed:0,nitro:100,dist:0}; let r=g[chat]
 if(act==="start"){r.speed=30;r.dist=0;r.nitro=100}
 if(act==="accelerate") r.speed=Math.min(340,r.speed+45),r.dist+=r.speed
 if(act==="brake") r.speed=Math.max(0,r.speed-40),r.dist+=r.speed/2
 if(act==="nitro"&&r.nitro>0) r.speed+=90,r.nitro-=25,r.dist+=r.speed
 if(act==="drift") r.dist+=r.speed+50
 if(r.dist>=2500){delete g[chat]; return sock.sendMessage(m.chat,{text:`🏁 ${sc("asphalt legend finished")}`},{quoted:m})}
 await sock.sendMessage(m.chat,{text:`🏎️ ᴀsᴘʜᴀʟᴛ 9\n⚡ ${sc(`speed: ${r.speed}`)}\n💨 ${sc(`nitro: ${r.nitro}%`)}\n🛣️ ${sc(`${r.dist}/2500m`)}`,
 buttons:[{buttonId:".asphalt accelerate",buttonText:{displayText:"🏎️ GAS"},type:1},{buttonId:".asphalt brake",buttonText:{displayText:"🛑 BRAKE"},type:1},{buttonId:".asphalt nitro",buttonText:{displayText:"🔥 NITRO"},type:1},{buttonId:".asphalt drift",buttonText:{displayText:"↪️ DRIFT"},type:1}],headerType:1},{quoted:m})
}}
