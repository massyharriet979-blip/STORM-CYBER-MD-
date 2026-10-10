import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

function getDB(chat){ let p=`./database/tictactoe_${chat}.json`; if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p)); return null; }
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/tictactoe_${chat}.json`,JSON.stringify(d)); }
function delDB(chat){ try{fs.unlinkSync(`./database/tictactoe_${chat}.json`);}catch{} }

function checkWin(b){
 let wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 for(let w of wins){ if(b[w[0]]&&b[w[0]]===b[w[1]]&&b[w[0]]===b[w[2]]) return b[w[0]]; }
 if(b.every(c=>c)) return "draw";
 return null;
}

function renderBoard(b){
 let e = b.map(c=> c? (c==="X"?"❌":"⭕") : "⬜");
 return `${e[0]}${e[1]}${e[2]}\n${e[3]}${e[4]}${e[5]}\n${e[6]}${e[7]}${e[8]}`;
}

export default{
name:"tictactoe",
aliases:["ttt","xo"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
  let chat=m.chat;
  let data=getDB(chat);
  let sub=args[0]?.toLowerCase() || "start";

  if(sub=="start" || sub=="new" ||!data){
   data={board:Array(9).fill(null), turn:"X", flip:0, players:{X:m.sender, O:null}, page:0};
   saveDB(chat,data);
   let cap=`**╭─❍ ${toSC("tic tac toe")} ❍─**\n`;
   cap+=`**│ ${renderBoard(data.board)}**\n`;
   cap+=`**│**\n**│ ❌ ${toSC("your turn")} - ${toSC("tap 1-9")}**\n`;
   cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("move: 1-9 positions"),
     buttons:[
       {buttonId:`.tictactoe 1`, buttonText:{displayText:`1️⃣`}, type:1},
       {buttonId:`.tictactoe 5`, buttonText:{displayText:`5️⃣ ${toSC("center")}`}, type:1},
       {buttonId:`.tictactoe flip`, buttonText:{displayText:`🔄 ${toSC("flip board")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="stop"){ delDB(chat); return await sock.sendMessage(chat,{text:`**🏳️ ${toSC("game stopped")}**`},{quoted:m}); }

  if(sub=="flip" || sub=="rotate"){
   data.page=(data.page+1)%3;
   data.flip=data.page;
   saveDB(chat,data);
   let sets=[[1,2,3],[4,5,6],[7,8,9]];
   let pos=sets[data.page];
   let cap=`**🔄 ${toSC("flipped")} - ${toSC("page")} ${data.page+1} | ${renderBoard(data.board)}**\n\n**${toSC("turn")}: ${data.turn}**`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC(`positions ${pos.join(",")}`),
     buttons: pos.map(p=>({buttonId:`.tictactoe ${p}`, buttonText:{displayText:`${p}️⃣`}, type:1})),
     headerType:1
   },{quoted:m});
  }

  if(sub=="board"){
   return await sock.sendMessage(chat,{text:`**${renderBoard(data.board)}**\n\n**${toSC("turn")}: ${data.turn}**`},{quoted:m});
  }

  let move=parseInt(sub);
  if(isNaN(move)||move<1||move>9) return await sock.sendMessage(chat,{text:`**${toSC("use 1-9")}.tictactoe 5**\n\n${renderBoard(data.board)}`},{quoted:m});
  let idx=move-1;
  if(data.board[idx]) return await sock.sendMessage(chat,{text:`**⚠️ ${toSC("already taken")}!**\n\n${renderBoard(data.board)}`},{quoted:m});

  data.board[idx]=data.turn;
  let win=checkWin(data.board);

  if(win){
   let cap="";
   if(win==="draw") cap=`**🤝 ${toSC("draw!")}**\n\n${renderBoard(data.board)}\n\n> ${toSC("powered by storm")} 𝐗`;
   else cap=`**🎉 ${toSC("winner")}: ${win} ${win==="X"?"❌":"⭕"}**\n\n${renderBoard(data.board)}\n\n> ${toSC("powered by storm")} 𝐗`;
   delDB(chat);
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("game over"),
     buttons:[
       {buttonId:`.tictactoe start`, buttonText:{displayText:`🔁 ${toSC("play again")}`}, type:1},
       {buttonId:`.tictactoe flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  // switch turn + bot move if single player
  data.turn = data.turn==="X"?"O":"X";

  // bot auto move if O and no second player
  if(data.turn==="O" &&!data.players.O){
   let empty=data.board.map((c,i)=>c?null:i).filter(v=>v!==null);
   let botMove=empty[Math.floor(Math.random()*empty.length)];
   data.board[botMove]="O";
   let win2=checkWin(data.board);
   if(win2){
     let cap="";
     if(win2==="draw") cap=`**🤝 ${toSC("draw!")}**\n\n${renderBoard(data.board)}\n\n> ${toSC("powered by storm")} 𝐗`;
     else cap=`**${win2==="O"? "🤖 "+toSC("bot wins") : "🎉 "+toSC("you win")}**\n\n${renderBoard(data.board)}\n\n> ${toSC("powered by storm")} 𝐗`;
     delDB(chat);
     return await sock.sendMessage(chat,{
       text:cap,
       footer: toSC("game over"),
       buttons:[
         {buttonId:`.tictactoe start`, buttonText:{displayText:`🔁 ${toSC("play again")}`}, type:1}
       ],
       headerType:1
     },{quoted:m});
   }
   data.turn="X";
  }

  saveDB(chat,data);
  let cap=`**${renderBoard(data.board)}**\n\n**${toSC("turn")}: ${data.turn} ${data.turn==="X"?"❌":"⭕"}**\n\n> ${toSC("powered by storm")} 𝐗`;

  // show available moves as buttons
  let empty=data.board.map((c,i)=>c?null:i+1).filter(v=>v);
  let btns=empty.slice(0,2).map(p=>({buttonId:`.tictactoe ${p}`, buttonText:{displayText:`${p}️⃣`}, type:1}));
  btns.push({buttonId:`.tictactoe flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1});

  await sock.sendMessage(chat,{
    text:cap,
    footer: toSC("your move"),
    buttons: btns,
    headerType:1
  },{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
