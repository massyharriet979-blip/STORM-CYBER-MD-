function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const NEWS="120363414065055650@newsletter";
const CHAN="https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P";

async function getNBA(){
 try{
  let r=await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard");
  let d=await r.json();
  return d.events||[];
 }catch{return [];}
}

export default{
name:"nba",
aliases:["basketball","nbalive"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🏀",key:m.key}});
  let sub=args[0]?.toLowerCase()||"live";
  let isFlip=args.includes("flip")||args.includes("rotate");

  if(sub==="board"){
   let cap=`**╭─❍ ${toSC("nba board")} ❍─**\n`;
   cap+=`**│ 🏀.nba live - ${toSC("live games")}**\n`;
   cap+=`**│ 📊.nba table - ${toSC("standings")}**\n`;
   cap+=`**│ 🔄 flip - ${toSC("swap home/away")}**\n`;
   cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(m.chat,{text:cap},{quoted:m});
  }

  let games=await getNBA();
  if(games.length===0){
   return await sock.sendMessage(m.chat,{text:`**🏀 ${toSC("no live games now")}**\n\n${CHAN}`},{quoted:m});
  }

  let txt=`**╭─❍ ${toSC("nba live")} ❍─**\n`;
  let postTxt=`**🏀 NBA LIVE SCORES**\n\n`;
  for(let g of games.slice(0,6)){
   let comp=g.competitions[0];
   let home=comp.competitors.find(c=>c.homeAway==="home");
   let away=comp.competitors.find(c=>c.homeAway==="away");
   let status=comp.status.type.detail;
   let hName=home.team.displayName, aName=away.team.displayName;
   let hScore=home.score, aScore=away.score;
   if(isFlip){ [hName,aName]=[aName,hName]; [hScore,aScore]=[aScore,hScore]; }
   txt+=`**│ ${isFlip?"🔄 ":""}${aName} ${aScore} - ${hScore} ${hName}**\n`;
   txt+=`**│ ⏱️ ${status}**\n**│**\n`;
   postTxt+=`${aName} ${aScore}-${hScore} ${hName} | ${status}\n`;
  }
  txt+=`**╰────────────────**\n\n**📢 ${NEWS}**\n**🔗 ${CHAN}**\n\n> ${toSC("powered by storm")} 𝐗`;

  // auto post to newsletter
  try{ await sock.sendMessage(NEWS,{text:postTxt+`\n\n${CHAN}`}); }catch{}

  await sock.sendMessage(m.chat,{
    text:txt,
    footer: toSC(`nba ${isFlip?"flipped":"live"}`),
    buttons:[
      {buttonId:`.nba live`, buttonText:{displayText:`🏀 ${toSC("refresh")}`}, type:1},
      {buttonId:`.nba flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
      {buttonId:`.nba board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1}
    ],
    headerType:1
  },{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
