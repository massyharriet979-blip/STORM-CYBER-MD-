import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

function getDB(chat){ let p=`./database/football_${chat}.json`; if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p)); return null; }
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/football_${chat}.json`,JSON.stringify(d)); }
function delDB(chat){ try{fs.unlinkSync(`./database/football_${chat}.json`);}catch{} }

export default{
name:"football",
aliases:["penalty","soccer"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"⚽",key:m.key}});
  let chat=m.chat;
  let data=getDB(chat);
  let sub=args[0]?.toLowerCase() || "start";

  if(sub=="start" || sub=="new" ||!data){
   data={userScore:0, botScore:0, round:1, maxRounds:5, turn:"shoot", // shoot then save
   flip:false, history:[]};
   saveDB(chat,data);
   let cap=`**╭─❍ ${toSC("football penalty")} ❍─**\n`;
   cap+=`**│ ⚽ ${toSC("best of 5 penalties")}**\n`;
   cap+=`**│ 🎯 ${toSC("you shoot first")}**\n`;
   cap+=`**│ 🥅 ${toSC("choose direction")}**\n`;
   cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("shoot! choose direction"),
     buttons:[
       {buttonId:`.football left`, buttonText:{displayText:`⬅️ ${toSC("left")}`}, type:1},
       {buttonId:`.football center`, buttonText:{displayText:`⬆️ ${toSC("center")}`}, type:1},
       {buttonId:`.football right`, buttonText:{displayText:`➡️ ${toSC("right")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="stop"){ delDB(chat); return await sock.sendMessage(chat,{text:`**🏳️ ${toSC("game ended")}**`},{quoted:m}); }

  if(sub=="board" || sub=="score"){
   let cap=`**⚽ ${toSC("scoreboard")} - ${toSC("round")} ${data.round}/${data.maxRounds}**\n\n`;
   cap+=`**👤 ${toSC("you")}: ${data.userScore}**\n**🤖 ${toSC("bot")}: ${data.botScore}**\n`;
   cap+=`**${data.turn==="shoot"? toSC("your turn to shoot") : toSC("your turn to save")}**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{text:cap},{quoted:m});
  }

  if(sub=="flip" || sub=="rotate"){
   data.flip=!data.flip;
   data.turn = data.turn==="shoot"? "save" : "shoot";
   saveDB(chat,data);
   return await sock.sendMessage(chat,{text:`**🔄 ${toSC("flipped")} - ${toSC("now")} ${data.turn}**`},{quoted:m});
  }

  let dirs=["left","center","right"];
  if(!dirs.includes(sub)){
   return await sock.sendMessage(chat,{text:`**${toSC("choose")} left / center / right**`},{quoted:m});
  }

  let botDir = dirs[Math.floor(Math.random()*3)];
  let result="";

  if(data.turn==="shoot"){
   // you shoot, bot saves
   if(sub===botDir){
     result=`**🧤 ${toSC("saved!")} ${toSC("you shot")} ${toSC(sub)} - ${toSC("bot saved")} ${toSC(botDir)}**\n\n**😭 ${toSC("no goal")}**`;
   } else {
     result=`**⚽ ${toSC("goaaal!")} ${toSC("you shot")} ${toSC(sub)} - ${toSC("bot dived")} ${toSC(botDir)}**\n\n**🎉 ${toSC("goal!")}**`;
     data.userScore++;
   }
   data.history.push(`R${data.round} shoot: you ${sub} vs bot ${botDir} = ${sub===botDir? "SAVE" : "GOAL"}`);
   data.turn="save";
   saveDB(chat,data);

   let cap=result+`\n\n**${toSC("score")}: You ${data.userScore} - ${data.botScore} Bot | ${toSC("round")} ${data.round}**\n\n**${toSC("now defend! bot shooting")}**\n\n> ${toSC("powered by storm")} 𝐗`;

   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("now save! choose direction"),
     buttons:[
       {buttonId:`.football left`, buttonText:{displayText:`⬅️ ${toSC("save left")}`}, type:1},
       {buttonId:`.football center`, buttonText:{displayText:`⬆️ ${toSC("save center")}`}, type:1},
       {buttonId:`.football right`, buttonText:{displayText:`➡️ ${toSC("save right")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});

  } else {
   // you save, bot shoots
   let botShoot = botDir; // bot's shoot direction
   if(sub===botShoot){
     result=`**🧤 ${toSC("you saved!")} ${toSC("bot shot")} ${toSC(botShoot)} - ${toSC("you dived")} ${toSC(sub)}**\n\n**✅ ${toSC("saved!")}**`;
   } else {
     result=`**💥 ${toSC("bot scored!")} ${toSC("bot shot")} ${toSC(botShoot)} - ${toSC("you dived")} ${toSC(sub)}**\n\n**😭 ${toSC("goal for bot")}**`;
     data.botScore++;
   }
   data.history.push(`R${data.round} save: bot ${botShoot} vs you ${sub} = ${sub===botShoot? "SAVE" : "GOAL"}`);
   data.round++;
   data.turn="shoot";

   if(data.round>data.maxRounds){
     let win = data.userScore>data.botScore? "you win!" : data.userScore<data.botScore? "bot wins" : "draw!";
     let final=`${result}\n\n**╭─❍ ${toSC("final score")} ❍─**\n**│ 👤 ${toSC("you")}: ${data.userScore}**\n**│ 🤖 ${toSC("bot")}: ${data.botScore}**\n**│ 🏆 ${toSC(win)}**\n**╰────────────────**\n\n${data.history.join("\n")}\n\n> ${toSC("powered by storm")} 𝐗`;
     delDB(chat);
     return await sock.sendMessage(chat,{
       text:final,
       footer: toSC("game over"),
       buttons:[
         {buttonId:`.football start`, buttonText:{displayText:`🔁 ${toSC("play again")}`}, type:1},
         {buttonId:`.football flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
       ],
       headerType:1
     },{quoted:m});
   }

   saveDB(chat,data);
   let cap=result+`\n\n**${toSC("score")}: You ${data.userScore} - ${data.botScore} Bot | ${toSC("round")} ${data.round}/${data.maxRounds}**\n\n**${toSC("your turn to shoot")}**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("shoot again"),
     buttons:[
       {buttonId:`.football left`, buttonText:{displayText:`⬅️ ${toSC("left")}`}, type:1},
       {buttonId:`.football center`, buttonText:{displayText:`⬆️ ${toSC("center")}`}, type:1},
       {buttonId:`.football right`, buttonText:{displayText:`➡️ ${toSC("right")}`}, type:1},
       {buttonId:`.football board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
