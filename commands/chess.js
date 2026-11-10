import { Chess } from 'chess.js';
import fs from 'fs';

function toSC(s){ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join(''); }

function getDB(chat){
  let p=`./database/chess_${chat}.json`;
  if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p));
  return null;
}
function saveDB(chat,data){
  fs.writeFileSync(`./database/chess_${chat}.json`, JSON.stringify(data));
}
function delDB(chat){
  try{ fs.unlinkSync(`./database/chess_${chat}.json`); }catch{}
}

function boardToText(chess, flip=false){
  let board = chess.board();
  if(flip) board = board.reverse().map(r=>r.reverse());
  let rows = ["8","7","6","5","4","3","2","1"];
  if(flip) rows = rows.reverse();
  let cols = flip? ["h","g","f","e","d","c","b","a"] : ["a","b","c","d","e","f","g","h"];
  let txt = ` ${cols.join(" ")}\n`;
  for(let i=0;i<8;i++){
    let r = board[i];
    let rowNum = rows[i];
    let line = `${rowNum} `;
    for(let j=0;j<8;j++){
      let p = r[j];
      if(!p) line += ((i+j)%2==0? "⬜" : "⬛")+" ";
      else {
        let map = {p:"♟️",n:"♞",b:"♝",r:"♜",q:"♛",k:"♚",P:"♙",N:"♘",B:"♗",R:"♖",Q:"♕",K:"♔"};
        let key = p.color=="w"? p.type.toUpperCase() : p.type.toLowerCase();
        if(p.color=="b") key = p.type;
        else key = p.type.toUpperCase();
        line += (map[key]||"?")+" ";
      }
    }
    line += ` ${rowNum}`;
    txt += line+"\n";
  }
  txt += ` ${cols.join(" ")}\n`;
  txt += `\n**${toSC(`turn`)}: ${chess.turn()=="w"? "⚪ White" : "⚫ Black"}**\n`;
  txt += `**${toSC(`moves`)}: ${chess.history().length}**\n`;
  if(chess.isCheck()) txt += `**⚠️ ${toSC("check!")}**\n`;
  if(chess.isGameOver()) txt += `**🏁 ${toSC("game over")}: ${chess.isCheckmate()? "Checkmate" : chess.isDraw()? "Draw" : "Over"}**\n`;
  return txt;
}

export default {
name:"chess",
aliases:["chessgame"],
execute: async(sock,m,args)=>{
 try{
   await sock.sendMessage(m.chat,{react:{text:"♟️",key:m.key}});
   let sub = args[0]?.toLowerCase() || "board";
   let chat = m.chat;
   let data = getDB(chat);
   let chess;

   if(sub=="start" || sub=="new"){
     chess = new Chess();
     saveDB(chat, {fen:chess.fen(), flip:false, white:m.sender, black:"", moves:[]});
     let txt = boardToText(chess,false);
     let cap = `**╭─❍ ${toSC("chess started")} ❍─**\n**│ ${toSC("white")} : @${m.sender.split("@")[0]}**\n**│ ${toSC("black")} : ${toSC("waiting for opponent")}**\n**│**\n${txt}\n**╰────────────────**\n\n**${toSC("use")}.chess e2e4**\n> ${toSC("powered by storm")} 𝐗`;

     await sock.sendMessage(chat,{
       text:cap,
       mentions:[m.sender],
       footer: toSC("chess controls"),
       buttons:[
         {buttonId:`.chess board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1},
         {buttonId:`.chess flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
         {buttonId:`.chess moves`, buttonText:{displayText:`📜 ${toSC("moves")}`}, type:1},
         {buttonId:`.chess resign`, buttonText:{displayText:`🏳️ ${toSC("resign")}`}, type:1}
       ],
       headerType:1
     },{quoted:m});
     return;
   }

   if(!data){
     return await sock.sendMessage(chat,{text:`**${toSC("no game found. start new game")}**\n\n**.chess start**\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});
   }

   chess = new Chess(data.fen);

   if(sub=="board" || sub==""){
     let txt = boardToText(chess,data.flip);
     await sock.sendMessage(chat,{
       text:`**${toSC("current board")}**\n\n${txt}\n\n> ${toSC("powered by storm")} 𝐗`,
       footer: toSC("chess controls"),
       buttons:[
         {buttonId:`.chess flip`, buttonText:{displayText:`🔄 ${toSC("flip board")}`}, type:1},
         {buttonId:`.chess moves`, buttonText:{displayText:`📜 ${toSC("history")}`}, type:1},
         {buttonId:`.chess resign`, buttonText:{displayText:`🏳️ ${toSC("resign")}`}, type:1}
       ],
       headerType:1
     },{quoted:m});
     return;
   }

   if(sub=="flip" || sub=="rotate"){
     data.flip =!data.flip;
     saveDB(chat,data);
     let txt = boardToText(chess,data.flip);
     await sock.sendMessage(chat,{text:`**🔄 ${toSC("board flipped")}**\n\n${txt}\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});
     return;
   }

   if(sub=="moves" || sub=="history"){
     let hist = chess.history().join(", ") || toSC("no moves yet");
     return await sock.sendMessage(chat,{text:`**📜 ${toSC("move history")}**\n\n${hist}\n\n**${toSC("fen")}:** ${chess.fen()}\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});
   }

   if(sub=="resign" || sub=="stop" || sub=="end"){
     delDB(chat);
     return await sock.sendMessage(chat,{text:`**🏳️ ${toSC("game resigned / ended")}**\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});
   }

   // MOVE: e2e4 or e2 e4
   let moveStr = args.join("").replace(/[^a-h1-8qrbnk]/gi,"").toLowerCase();
   if(args.length==2) moveStr = args[0]+args[1];
   if(!moveStr || moveStr.length<4){
     return await sock.sendMessage(chat,{text:`**${toSC("invalid move. example")}.chess e2e4**\n**${toSC("or")}.chess e2 e4**`},{quoted:m});
   }

   let from = moveStr.slice(0,2);
   let to = moveStr.slice(2,4);
   let promo = moveStr[4] || "q";

   try{
     let move = chess.move({from,to,promotion:promo});
     if(!move){
       return await sock.sendMessage(chat,{text:`**❌ ${toSC("illegal move")} : ${from} -> ${to}**`},{quoted:m});
     }
     data.fen = chess.fen();
     saveDB(chat,data);
     let txt = boardToText(chess,data.flip);
     let cap = `**✅ ${toSC("move")}: ${move.san} (${from} → ${to})**\n\n${txt}\n`;

     if(chess.isGameOver()){
       cap += `\n**🏁 ${toSC("game over")}: ${chess.isCheckmate()? `${toSC("checkmate")} ♔` : `${toSC("draw")}`}**\n`;
       delDB(chat);
       await sock.sendMessage(chat,{text:cap},{quoted:m});
     } else {
       await sock.sendMessage(chat,{
         text:cap+`\n> ${toSC("powered by storm")} 𝐗`,
         footer: toSC("next move"),
         buttons:[
           {buttonId:`.chess board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1},
           {buttonId:`.chess flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
           {buttonId:`.chess resign`, buttonText:{displayText:`🏳️ ${toSC("resign")}`}, type:1}
         ],
         headerType:1
       },{quoted:m});
     }

   }catch(e){
     await sock.sendMessage(chat,{text:`**❌ ${toSC("invalid move")}: ${e.message}**`},{quoted:m});
   }

 }catch(e){
   await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
