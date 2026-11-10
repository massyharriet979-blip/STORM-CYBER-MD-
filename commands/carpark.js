function sc(t){const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return t.toLowerCase().split('').map(c=>m[c]||c).join('')}
let g={}
export default {
name:"carpark",alias:["parking"],
execute: async(sock,m,args)=>{
 if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner) return sock.sendMessage(m.chat,{text:`${sc("restricted")}\n\n${sc("quantum clearance required, owner only")}`},{quoted:m})
 let chat=m.chat,act=args[0]||"start"; if(!g[chat]) g[chat]={x:0,y:0,gear:"P"}; let r=g[chat]
 if(act==="start"){r.x=0;r.y=0;r.gear="D"}
 if(act==="forward") r.y++
 if(act==="back") r.y--
 if(act==="left") r.x--
 if(act==="right") r.x++
 if(r.x==3 && r.y==3){delete g[chat]; return sock.sendMessage(m.chat,{text:`✅ ${sc("perfect parking!")}`},{quoted:m})}
 await sock.sendMessage(m.chat,{text:`🅿️ ᴄᴀʀ ᴘᴀʀᴋɪɴɢ\n📍 ${sc(`pos: ${r.x},${r.y} target: 3,3`)}\n⚙️ ${sc(`gear: ${r.gear}`)}`,
 buttons:[{buttonId:".carpark forward",buttonText:{displayText:"⬆️ FORWARD"},type:1},{buttonId:".carpark back",buttonText:{displayText:"⬇️ BACK"},type:1},{buttonId:".carpark left",buttonText:{displayText:"⬅️ LEFT"},type:1},{buttonId:".carpark right",buttonText:{displayText:"RIGHT ➡️"},type:1}],headerType:1},{quoted:m})
}}
