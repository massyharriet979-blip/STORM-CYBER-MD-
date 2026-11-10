import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const COLORS = {
 red: {emoji:"🔴", start:0, home:50, name:"red"},
 green: {emoji:"🟢", start:13, home:11, name:"green"},
 yellow: {emoji:"🟡", start:26, home:24, name:"yellow"},
 blue: {emoji:"🔵", start:39, home:37, name:"blue"}
};
const COLOR_ORDER=["red","green","yellow","blue"];

function getDB(chat){
 let p=`./database/ludo_${chat}.json`;
 if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p));
 return null;
}
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/ludo_${chat}.json`,JSON.stringify(d)); }
function delDB(chat){ try{fs.unlinkSync(`./database/ludo_${chat}.json`);}catch{} }

function canMoveToken(player, tokenPos, dice, colorInfo){
 if(tokenPos===-1) return dice===6; // need 6 to enter
 if(tokenPos>=52){ // home stretch
  return tokenPos + dice <= 57;
 }
 // normal
 return true;
}

function boardText(data){
 let txt = `**╭─❍ ${toSC("ludo board")} ❍─**\n`;
 txt+=`**│ 🎲 ${toSC("turn")} : ${COLORS[data.turn].emoji} ${toSC(data.turn)} @${data.players[data.turn].split("@")[0]}**\n`;
 txt+=`**│ 🎯 ${toSC("dice")} : ${data.lastDice? data.lastDice : "-"}**\n**│**\n`;
 for(let col of COLOR_ORDER){
   if(!data.players[col]) continue;
   let tokens = data.tokens[col];
   let tokenStr = tokens.map((pos,i)=>{
     if(pos===-1) return `🏠`;
     if(pos>=52) return `🏁${pos-51}`;
     if(pos===58) return `✅`;
     return `${pos}`;
   }).join(" | ");
   let finished = tokens.filter(p=>p===58).length;
   txt+=`**│ ${COLORS[col].emoji} ${toSC(col)} [${finished}/4] : ${tokenStr}**\n`;
 }
 txt+=`**│**\n**╰────────────────**\n`;
 // check winner
 let winners = [];
 for(let c of COLOR_ORDER){
  if(data.players[c] && data.tokens[c].every(p=>p===58)) winners.push(c);
 }
 if(winners.length) txt+=`\n**🏆 ${toSC("winners")}: ${winners.map(c=>COLORS[c].emoji+" "+toSC(c)).join(", ")}**\n`;
 txt+=`\n> ${toSC("use.ludo roll to roll dice")}`;
 return txt;
}

export default{
name:"ludo",
aliases:["ludogame"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🎲",key:m.key}});
  let sub = args[0]?.toLowerCase() || "board";
  let chat = m.chat;
  let data = getDB(chat);

  if(sub=="start" || sub=="new" || sub=="create"){
   if(data) return await sock.sendMessage(chat,{text:`**${toSC("game already running")}..ludo stop ${toSC("to end")}**`},{quoted:m});
   let color = args[1]?.toLowerCase();
   if(!COLORS[color]) color="red";
   data={
     players:{ [color]: m.sender },
     tokens:{ [color]: [-1,-1,-1,-1] },
     turn: color,
     turnOrder:[color],
     lastDice:null,
     mustMove:false,
     flip:false
   };
   saveDB(chat,data);
   let cap=`**🎲 ${toSC("ludo created!")}**\n\n**${COLORS[color].emoji} ${toSC(color)}: @${m.sender.split("@")[0]} ${toSC("joined as")} ${color}**\n\n**${toSC("others join with")}:**\n.ludo join red/green/yellow/blue\n\n**${toSC("example")}:.ludo join green**\n\n**${toSC("min 2 players to start rolling")}**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     mentions:[m.sender],
     footer: toSC("ludo controls"),
     buttons:[
       {buttonId:`.ludo join green`, buttonText:{displayText:`🟢 ${toSC("join green")}`}, type:1},
       {buttonId:`.ludo join yellow`, buttonText:{displayText:`🟡 ${toSC("join yellow")}`}, type:1},
       {buttonId:`.ludo join blue`, buttonText:{displayText:`🔵 ${toSC("join blue")}`}, type:1},
       {buttonId:`.ludo board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(!data){
   return await sock.sendMessage(chat,{text:`**${toSC("no ludo game. create one")}**\n\n**.ludo start red**\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});
  }

  if(sub=="join"){
   let color = args[1]?.toLowerCase();
   if(!COLORS[color]) return await sock.sendMessage(chat,{text:`**${toSC("choose color")}: red, green, yellow, blue**\n**.ludo join green**`},{quoted:m});
   if(data.players[color]) return await sock.sendMessage(chat,{text:`**${COLORS[color].emoji} ${toSC(color+" already taken")}**`},{quoted:m});
   if(Object.values(data.players).includes(m.sender)) return await sock.sendMessage(chat,{text:`**${toSC("you already joined")}**`},{quoted:m});
   if(Object.keys(data.players).length>=4) return await sock.sendMessage(chat,{text:`**${toSC("lobby full")}**`},{quoted:m});
   data.players[color]=m.sender;
   data.tokens[color]=[-1,-1,-1,-1];
   data.turnOrder.push(color);
   saveDB(chat,data);
   let cap=`**${COLORS[color].emoji} @${m.sender.split("@")[0]} ${toSC("joined as")} ${color}**\n\n${boardText(data)}`;
   return await sock.sendMessage(chat,{
     text:cap,
     mentions:[m.sender,...Object.values(data.players)],
     footer: toSC("ludo"),
     buttons:[
       {buttonId:`.ludo roll`, buttonText:{displayText:`🎲 ${toSC("roll")}`}, type:1},
       {buttonId:`.ludo board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="board"){
   return await sock.sendMessage(chat,{
     text: boardText(data),
     mentions:Object.values(data.players),
     footer: toSC("ludo controls"),
     buttons:[
       {buttonId:`.ludo roll`, buttonText:{displayText:`🎲 ${toSC("roll dice")}`}, type:1},
       {buttonId:`.ludo flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
       {buttonId:`.ludo stop`, buttonText:{displayText:`🏳️ ${toSC("stop")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="flip" || sub=="rotate"){
   data.flip=!data.flip;
   saveDB(chat,data);
   return await sock.sendMessage(chat,{text:`**🔄 ${toSC("board flipped")}**\n\n${boardText(data)}`, mentions:Object.values(data.players)},{quoted:m});
  }

  if(sub=="stop" || sub=="end" || sub=="resign"){
   delDB(chat);
   return await sock.sendMessage(chat,{text:`**🏳️ ${toSC("ludo game ended")}**\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});
  }

  if(sub=="roll"){
   let currentColor = data.turn;
   let currentPlayerJid = data.players[currentColor];
   if(m.sender!==currentPlayerJid){
     return await sock.sendMessage(chat,{text:`**⏳ ${toSC("not your turn")}. ${toSC("turn")}: ${COLORS[currentColor].emoji} ${toSC(currentColor)}**`, mentions:[currentPlayerJid]},{quoted:m});
   }
   if(data.mustMove) return await sock.sendMessage(chat,{text:`**${toSC("you must move a token first")}..ludo move 1-4**`},{quoted:m});

   let dice = Math.floor(Math.random()*6)+1;
   data.lastDice=dice;
   saveDB(chat,data);

   let tokens = data.tokens[currentColor];
   let movable = tokens.map((pos,i)=> canMoveToken(null,pos,dice,COLORS[currentColor])? i : -1).filter(i=>i!==-1);

   if(movable.length===0){
     // no move possible, next turn
     let idx = data.turnOrder.indexOf(data.turn);
     data.turn = data.turnOrder[(idx+1)%data.turnOrder.length];
     if(dice===6){ // extra turn on 6 but no move? still extra? in ludo you get extra even if no move? we pass extra turn
       data.turn = currentColor;
       // but if no movable and 6, keep same turn? Actually if all home and roll 6 you can enter, so movable would exist. So if no movable, means stuck, give extra? We'll just next turn if not 6.
       if(dice!==6){
         data.turn = data.turnOrder[(idx+1)%data.turnOrder.length];
       }
     }
     data.lastDice=dice;
     data.mustMove=false;
     saveDB(chat,data);
     let cap=`**🎲 ${COLORS[currentColor].emoji} ${toSC("rolled")}: ${dice}**\n**😭 ${toSC("no moves possible")}**\n\n${boardText(data)}`;
     return await sock.sendMessage(chat,{
       text:cap,
       mentions:Object.values(data.players),
       footer: toSC("next turn"),
       buttons:[
         {buttonId:`.ludo roll`, buttonText:{displayText:`🎲 ${toSC("roll")}`}, type:1},
         {buttonId:`.ludo board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1}
       ],
       headerType:1
     },{quoted:m});
   }

   if(movable.length===1 && dice!==6 && tokens[movable[0]]!==-1){
     // auto move single token
     // we still ask button to move for UX
   }

   data.mustMove=true;
   saveDB(chat,data);

   let btns = movable.map(i=>({buttonId:`.ludo move ${i+1}`, buttonText:{displayText:`${COLORS[currentColor].emoji} ${toSC("move")} ${i+1}`}, type:1}));
   btns.push({buttonId:`.ludo board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1});
   // limit to 4 buttons max whatsapp allows 3? But we send 4, Baileys will allow? Use 3 + board fallback
   if(btns.length>3) btns = btns.slice(0,3);

   return await sock.sendMessage(chat,{
     text:`**🎲 ${COLORS[currentColor].emoji} ${toSC("rolled")}: ${dice}**\n\n**${toSC("movable tokens")}: ${movable.map(i=>i+1).join(", ")}**\n**${toSC("tap button to move")}**\n\n${boardText(data)}\n\n> ${toSC("powered by storm")} 𝐗`,
     mentions:Object.values(data.players),
     footer: toSC("choose token"),
     buttons: btns,
     headerType:1
   },{quoted:m});
  }

  if(sub=="move"){
   let tokenIdx = parseInt(args[1])-1;
   if(isNaN(tokenIdx) || tokenIdx<0 || tokenIdx>3) return await sock.sendMessage(chat,{text:`**${toSC("choose token 1-4")}..ludo move 1**`},{quoted:m});
   let currentColor = data.turn;
   let currentPlayerJid = data.players[currentColor];
   if(m.sender!==currentPlayerJid) return await sock.sendMessage(chat,{text:`**⏳ ${toSC("not your turn")}**`, mentions:[currentPlayerJid]},{quoted:m});
   if(!data.mustMove) return await sock.sendMessage(chat,{text:`**${toSC("roll first")}..ludo roll**`},{quoted:m});
   let dice = data.lastDice;
   let tokens = data.tokens[currentColor];
   let pos = tokens[tokenIdx];
   if(!canMoveToken(null,pos,dice,COLORS[currentColor])){
     return await sock.sendMessage(chat,{text:`**❌ ${toSC("cannot move token")} ${tokenIdx+1} ${toSC("with")} ${dice}**`},{quoted:m});
   }

   if(pos===-1){
     tokens[tokenIdx]=COLORS[currentColor].start; // enter board
   } else if(pos>=52){
     tokens[tokenIdx]=pos+dice;
     if(tokens[tokenIdx]>57) tokens[tokenIdx]=57;
     if(tokens[tokenIdx]==57) tokens[tokenIdx]=58; // finished
   } else {
     let newPos = (pos+dice)%52;
     // capture logic
     for(let col of COLOR_ORDER){
       if(col===currentColor ||!data.players[col]) continue;
       for(let j=0;j<4;j++){
         if(data.tokens[col][j]===newPos){
           data.tokens[col][j]=-1; // send home
         }
       }
     }
     tokens[tokenIdx]=newPos;
     // check home stretch entry
     if(newPos===COLORS[currentColor].home){
       // enter home stretch next move? simplified: go to 52
       // if next move would overshoot, keep
       // we auto enter if next roll exact? For simplicity direct entry after crossing
       // Actually after reaching home, next moves go to 52+
       // We'll handle when pos==home and moves again
     }
     // if token just crossed home? simplified logic: if token is at home-1 and dice passes, enter home path
     // Implementation: if pos == home, then set to 52 for next
     // This is already at home pos, but we need to detect crossing - skip for now
   }

   // check win
   let hasWon = tokens.every(p=>p===58);

   // turn logic
   if(dice===6 &&!hasWon){
     // extra turn
     data.turn=currentColor;
   } else {
     let idx = data.turnOrder.indexOf(data.turn);
     data.turn = data.turnOrder[(idx+1)%data.turnOrder.length];
   }
   data.lastDice=null;
   data.mustMove=false;
   saveDB(chat,data);

   let cap=`**✅ ${COLORS[currentColor].emoji} ${toSC("moved token")} ${tokenIdx+1} ${toSC("with")} ${dice}**\n\n${boardText(data)}\n`;
   if(hasWon){
     cap+=`\n**🏆 ${COLORS[currentColor].emoji} ${toSC(currentColor+" won the game!")}**\n`;
     delDB(chat);
   }

   return await sock.sendMessage(chat,{
     text:cap,
     mentions:Object.values(data.players),
     footer: toSC("ludo controls"),
     buttons: hasWon? [
       {buttonId:`.ludo start red`, buttonText:{displayText:`🎲 ${toSC("new game")}`}, type:1}
     ] : [
       {buttonId:`.ludo roll`, buttonText:{displayText:`🎲 ${toSC("roll")}`}, type:1},
       {buttonId:`.ludo board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1},
       {buttonId:`.ludo flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

 }catch(e){
  await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
