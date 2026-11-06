import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

function getDB(chat){ let p=`./database/cricket_${chat}.json`; if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p)); return null; }
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/cricket_${chat}.json`,JSON.stringify(d)); }
function delDB(chat){ try{fs.unlinkSync(`./database/cricket_${chat}.json`);}catch{} }

export default{
name:"cricket",
aliases:["handcricket","gully"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🏏",key:m.key}});
  let chat=m.chat;
  let data=getDB(chat);
  let sub=args[0]?.toLowerCase() || "start";

  if(sub=="start" || sub=="new" ||!data){
   data={
     score:0, balls:0, wickets:0,
     target:0, innings:1, // 1 user batting, 2 bot batting
     batting: true, // user batting first
     flip:false,
     lastBot:0,
     overs:0
   };
   saveDB(chat,data);
   let cap=`**╭─❍ ${toSC("cricket started")} ❍─**\n`;
   cap+=`**│ 🏏 ${toSC("you are batting first")}**\n`;
   cap+=`**│ 🎯 ${toSC("send 1-6 to bat")}**\n`;
   cap+=`**│ 💀 ${toSC("same number = out")}**\n`;
   cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("tap number to bat"),
     buttons:[
       {buttonId:`.cricket 1`, buttonText:{displayText:`1️⃣`}, type:1},
       {buttonId:`.cricket 2`, buttonText:{displayText:`2️⃣`}, type:1},
       {buttonId:`.cricket 3`, buttonText:{displayText:`3️⃣`}, type:1},
       {buttonId:`.cricket 6`, buttonText:{displayText:`6️⃣ SIX!`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="stop" || sub=="end"){
   delDB(chat);
   return await sock.sendMessage(chat,{text:`**🏳️ ${toSC("cricket ended")}**`},{quoted:m});
  }

  if(sub=="board" || sub=="score"){
   let cap=`**🏏 ${toSC("scoreboard")}**\n\n`;
   cap+=`**${data.innings===1? toSC("1st innings - you batting") : toSC("2nd innings - chasing "+data.target)}**\n`;
   cap+=`**${toSC("score")}: ${data.score}/${data.wickets} in ${data.overs}.${data.balls%6} overs**\n`;
   cap+=`**${toSC("last bot")}: ${data.lastBot}**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("cricket controls"),
     buttons:[
       {buttonId:`.cricket board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1},
       {buttonId:`.cricket flip`, buttonText:{displayText:`🔄 ${toSC("flip innings")}`}, type:1},
       {buttonId:`.cricket stop`, buttonText:{displayText:`🏳️ ${toSC("stop")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="flip" || sub=="rotate"){
   // flip innings - switch batting/bowling
   if(data.innings===1){
     data.target=data.score+1;
     data.score=0; data.balls=0; data.wickets=0; data.overs=0;
     data.innings=2; data.batting=false;
   } else {
     data.innings=1; data.batting=true; data.score=0; data.balls=0; data.wickets=0; data.target=0; data.overs=0;
   }
   data.flip=!data.flip;
   saveDB(chat,data);
   return await sock.sendMessage(chat,{text:`**🔄 ${toSC("innings flipped")} - ${data.batting? toSC("you batting") : toSC("you bowling")} | ${toSC("target")}: ${data.target}**`},{quoted:m});
  }

  let num=parseInt(sub);
  if(isNaN(num) || num<1 || num>6){
   return await sock.sendMessage(chat,{text:`**${toSC("send 1-6")}.cricket 4**`},{quoted:m});
  }

  let bot = Math.floor(Math.random()*6)+1;
  data.lastBot=bot;
  data.balls++;
  if(data.balls%6===0) data.overs++;

  let cap="";

  if(data.innings===1){ // user batting
   if(num===bot){
     cap=`**💥 ${toSC("out!")} ${num} vs ${bot}**\n\n`;
     cap+=`**${toSC("your score")}: ${data.score}**\n`;
     cap+=`**${toSC("target for bot")}: ${data.score+1}**\n\n`;
     data.target=data.score+1;
     data.score=0; data.balls=0; data.overs=0; data.wickets=0;
     data.innings=2; data.batting=false;
     saveDB(chat,data);
     cap+=`**🤖 ${toSC("bot batting now - defend")} ${data.target}**\n\n> ${toSC("powered by storm")} 𝐗`;
     return await sock.sendMessage(chat,{
       text:cap,
       footer: toSC("now bowling"),
       buttons:[
         {buttonId:`.cricket 1`, buttonText:{displayText:`1️⃣`}, type:1},
         {buttonId:`.cricket 2`, buttonText:{displayText:`2️⃣`}, type:1},
         {buttonId:`.cricket 4`, buttonText:{displayText:`4️⃣`}, type:1},
         {buttonId:`.cricket 6`, buttonText:{displayText:`6️⃣`}, type:1}
       ],
       headerType:1
     },{quoted:m});
   } else {
     data.score+=num;
     saveDB(chat,data);
     cap=`**🏏 ${num} vs ${bot} - ${num} ${toSC("runs!")}**\n\n`;
     cap+=`**${toSC("score")}: ${data.score} | ${data.overs}.${data.balls%6} ${toSC("overs")}**\n\n> ${toSC("powered by storm")} 𝐗`;
   }
  } else { // innings 2 bot batting - you bowling
   if(num===bot){
     // you win - bot out
     cap=`**🎉 ${toSC("you won! bot out!")} ${num} vs ${bot}**\n\n`;
     cap+=`**🤖 ${toSC("bot score")}: ${data.score} | ${toSC("target was")} ${data.target}**\n`;
     cap+=`**🏆 ${toSC("you defended successfully")}**\n\n> ${toSC("powered by storm")} 𝐗`;
     delDB(chat);
     return await sock.sendMessage(chat,{
       text:cap,
       footer: toSC("victory"),
       buttons:[
         {buttonId:`.cricket start`, buttonText:{displayText:`🔁 ${toSC("play again")}`}, type:1},
         {buttonId:`.cricket flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
       ],
       headerType:1
     },{quoted:m});
   } else {
     data.score+=bot;
     saveDB(chat,data);
     if(data.score>=data.target){
       cap=`**😭 ${toSC("bot won!")} ${bot} vs ${num}**\n\n`;
       cap+=`**🤖 ${data.score} >= ${data.target}**\n`;
       cap+=`**${toSC("you lost")}**\n\n> ${toSC("powered by storm")} 𝐗`;
       delDB(chat);
       return await sock.sendMessage(chat,{
         text:cap,
         footer: toSC("defeat"),
         buttons:[
           {buttonId:`.cricket start`, buttonText:{displayText:`🔁 ${toSC("play again")}`}, type:1}
         ],
         headerType:1
       },{quoted:m});
     } else {
       cap=`**🤖 ${bot} vs ${num} - ${toSC("bot scored")} ${bot}**\n\n`;
       cap+=`**${toSC("bot score")}: ${data.score}/${data.target-1} | ${toSC("need")} ${data.target-data.score}**\n\n> ${toSC("powered by storm")} 𝐗`;
     }
   }
  }

  saveDB(chat,data);
  await sock.sendMessage(chat,{
    text:cap,
    footer: data.batting? toSC("batting - choose run") : toSC("bowling - choose number"),
    buttons:[
      {buttonId:`.cricket 1`, buttonText:{displayText:`1️⃣`}, type:1},
      {buttonId:`.cricket 3`, buttonText:{displayText:`3️⃣`}, type:1},
      {buttonId:`.cricket 6`, buttonText:{displayText:`6️⃣`}, type:1},
      {buttonId:`.cricket board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1}
    ],
    headerType:1
  },{quoted:m});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
