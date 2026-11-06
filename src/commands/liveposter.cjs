import fs from 'fs';
const NEWSLETTER_JID = "120363414065055650@newsletter";
const CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P";

let interval = null;

function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

async function fetchLive(){
 try{
  // free live - uses ESPN
  let res = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard", {headers:{"User-Agent":"Mozilla/5.0"}});
  let data = await res.json();
  let games = data.events?.slice(0,5) || [];
  if(games.length===0){
   // fallback to world
   let r2 = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=" + new Date().toISOString().split('T')[0]);
   let d2 = await r2.json();
   games = d2.events?.slice(0,5) || [];
  }
  if(games.length===0) return null;
  let txt = `**╭─❍ ${toSC("live football")} ❍─**\n`;
  for(let g of games){
   let comp = g.competitions[0];
   let home = comp.competitors.find(c=>c.homeAway==="home");
   let away = comp.competitors.find(c=>c.homeAway==="away");
   let status = comp.status.type.detail;
   txt+=`**│ ⚽ ${home.team.displayName} ${home.score} - ${away.score} ${away.team.displayName}**\n`;
   txt+=`**│ ⏱️ ${status}**\n**│**\n`;
  }
  txt+=`**╰────────────────**\n\n`;
  txt+=`**📢 ${NEWSLETTER_JID}**\n**🔗 ${CHANNEL_LINK}**\n\n> ${toSC("powered by storm")} 𝐗`;
  return txt;
 }catch(e){ return null; }
}

export function startLivePoster(sock){
 if(interval) clearInterval(interval);
 interval = setInterval(async ()=>{
  let scoreText = await fetchLive();
  if(!scoreText) return;
  try{
   await sock.sendMessage(NEWSLETTER_JID, {text: scoreText});
   console.log("[LIVE] posted to newsletter");
  }catch(e){ console.log("[LIVE] newsletter fail", e.message); }
 }, 3*60*1000); // 3 mins
 console.log("[LIVE] auto poster started -> "+NEWSLETTER_JID);
}

export function stopLivePoster(){
 if(interval) clearInterval(interval);
 interval=null;
}
