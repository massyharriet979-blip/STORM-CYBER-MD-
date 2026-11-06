import { startLivePoster, stopLivePoster } from "../utils/livePoster.js";
const NEWSLETTER_JID = "120363414065055650@newsletter";
const CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P";
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

export default{
name:"livescore",
aliases:["live","livescores","score"],
execute: async(sock,m,args)=>{
 let sub=args[0]?.toLowerCase() || "on";
 if(sub==="on" || sub==="start"){
   startLivePoster(sock);
   let cap=`**✅ ${toSC("live poster started")}**\n\n`;
   cap+=`**📢 ${toSC("posting to")}: ${NEWSLETTER_JID}**\n`;
   cap+=`**⏱️ ${toSC("every 3 mins")}**\n`;
   cap+=`**🔗 ${CHANNEL_LINK}**\n\n> ${toSC("powered by storm")} 𝐗`;
   await sock.sendMessage(m.chat,{
     text:cap,
     footer: toSC("live controls"),
     buttons:[
       {buttonId:`.livescore now`, buttonText:{displayText:`⚽ ${toSC("get now")}`}, type:1},
       {buttonId:`.livescore off`, buttonText:{displayText:`🛑 ${toSC("stop")}`}, type:1},
       {buttonId:`.sports`, buttonText:{displayText:`🏆 ${toSC("sports menu")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
   // also send immediate
   try{
     let res = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard");
     let data = await res.json();
     let ev = data.events?.[0];
     if(ev){
       let comp=ev.competitions[0];
       let home=comp.competitors.find(c=>c.homeAway==="home");
       let away=comp.competitors.find(c=>c.homeAway==="away");
       await sock.sendMessage(NEWSLETTER_JID, {text:`**⚽ LIVE NOW: ${home.team.displayName} ${home.score}-${away.score} ${away.team.displayName} [${comp.status.type.detail}]**\n\n${CHANNEL_LINK}`});
     }
   }catch{}
 } else if(sub==="off" || sub==="stop"){
   stopLivePoster();
   await sock.sendMessage(m.chat,{text:`**🛑 ${toSC("live poster stopped")}**`},{quoted:m});
 } else if(sub==="now"){
   let res = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard");
   let data = await res.json();
   let games=data.events?.slice(0,5) || [];
   let txt=`**⚽ ${toSC("live now")}**\n\n`;
   for(let g of games){
     let c=g.competitions[0];
     let h=c.competitors.find(x=>x.homeAway==="home");
     let a=c.competitors.find(x=>x.homeAway==="away");
     txt+=`${h.team.displayName} ${h.score}-${a.score} ${a.team.displayName} (${c.status.type.detail})\n`;
   }
   await sock.sendMessage(m.chat,{text:txt},{quoted:m});
   await sock.sendMessage(NEWSLETTER_JID,{text:txt+`\n\n${CHANNEL_LINK}`});
 }
}
}
