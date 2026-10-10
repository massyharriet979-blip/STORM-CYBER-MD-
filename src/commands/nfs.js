function sc(t){const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return t.toLowerCase().split('').map(c=>m[c]||c).join('')}
let races={}
export default {
name:"nfs",alias:["needforspeed"],
execute: async(sock,m,args)=>{
 if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner){
  return sock.sendMessage(m.chat,{text:`${sc("restricted")}\n\n${sc("quantum clearance required, owner only")}`},{quoted:m})
 }
 let chat=m.chat,act=args[0]||"start"
 if(!races[chat]) races[chat]={speed:0,nitro:100,distance:0}
 let r=races[chat]
 if(act==="start"){ r.speed=20; r.distance=0; r.nitro=100 }
 if(act==="accelerate"){ r.speed=Math.min(320,r.speed+40); r.distance+=r.speed }
 if(act==="brake"){ r.speed=Math.max(0,r.speed-50); r.distance+=Math.floor(r.speed/2) }
 if(act==="nitro"){ if(r.nitro>=20){ r.speed=Math.min(400,r.speed+80); r.nitro-=20; r.distance+=r.speed } }
 if(act==="drift"){ r.speed=Math.max(60,r.speed-10); r.distance+=r.speed+30 }
 if(r.distance>=2000){ delete races[chat]; return sock.sendMessage(m.chat,{text:`🏆 ${sc("nfs finished! winner")}\n🏎️ ${sc(`final ${r.speed} km/h`)}`},{quoted:m}) }
 await sock.sendMessage(m.chat,{text:`🏁 ɴғs sᴛʀᴇᴇᴛ\n🚗 ${sc(`speed: ${r.speed} km/h`)}\n💨 ${sc(`nitro: ${r.nitro}%`)}\n📏 ${sc(`${r.distance}/2000m`)}`,
 buttons:[{buttonId:".nfs accelerate",buttonText:{displayText:"🏎️ GAS"},type:1},{buttonId:".nfs brake",buttonText:{displayText:"🛑 BRAKE"},type:1},{buttonId:".nfs nitro",buttonText:{displayText:"💨 NITRO"},type:1},{buttonId:".nfs drift",buttonText:{displayText:"💫 DRIFT"},type:1}],headerType:1},{quoted:m})
}}
