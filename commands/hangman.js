import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const WORDS=["javascript","python","whatsapp","storm","bot","ludo","chess","football","cricket","hangman","google","meta","github","coding","server","mobile","laptop","uganda","kampala","africa","diamond","chicken","rocket","planet","galaxy","banana","orange","computer","keyboard","monster","dragon","wizard","pokemon","naruto","anime","messi","ronaldo"];
const HANG = ["\n\n\n\n\n","___\n | \n O \n","___\n | \n O \n/ \n","___\n | \n O \n/ \\ \n","___\n | \n O \n/ \\ \n | \n","___\n | \n O \n/ \\ \n | \n/ \n","💀"];

function getDB(chat){ let p=`./database/hangman_${chat}.json`; if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p)); return null; }
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/hangman_${chat}.json`,JSON.stringify(d)); }
function delDB(chat){ try{fs.unlinkSync(`./database/hangman_${chat}.json`);}catch{} }

function render(data){
 let display = data.word.split("").map(c=> data.guessed.includes(c)? c : "_").join(" ");
 let wrong = data.wrong.join(", ");
 let stage = HANG[Math.min(data.wrong.length, HANG.length-1)];
 return {display, wrong, stage};
}

export default{
name:"hangman",
aliases:["hang"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🪓",key:m.key}});
  let chat=m.chat;
  let data=getDB(chat);
  let sub=args[0]?.toLowerCase() || "start";

  if(sub=="start" || sub=="new" ||!data){
   let word = WORDS[Math.floor(Math.random()*WORDS.length)];
   data={word, guessed:[], wrong:[], lives:6, flip:false, page:0};
   saveDB(chat,data);
  }

  if(sub=="stop"){ delDB(chat); return await sock.sendMessage(chat,{text:`**🏳️ ${toSC("game stopped. word was")} ${data?.word}**`},{quoted:m}); }

  if(sub=="board"){
   let {display,wrong,stage}=render(data);
   let cap=`**╭─❍ ${toSC("hangman")} ❍─**\n**│ 📝 ${display}**\n**│ ❌ ${toSC("wrong")}: ${wrong|| toSC("none")}**\n**│ ❤️ ${toSC("lives")}: ${6-data.wrong.length}**\n**│**\n\`\`\`${stage}\`\`\`\n**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("guess a letter"),
     buttons:[
       {buttonId:`.hangman a`, buttonText:{displayText:`🅰️ A`}, type:1},
       {buttonId:`.hangman e`, buttonText:{displayText:`🇪 E`}, type:1},
       {buttonId:`.hangman flip`, buttonText:{displayText:`🔄 ${toSC("flip letters")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="flip" || sub=="rotate"){
   data.flip=!data.flip;
   data.page = (data.page+1)%3;
   saveDB(chat,data);
   let sets=[["a","e","i","o"],["u","s","t","r"],["n","l","m","p"]];
   let letters=sets[data.page];
   let {display,wrong,stage}=render(data);
   let cap=`**🔄 ${toSC("flipped letters")} - ${toSC("page")} ${data.page+1}**\n\n**${display}**\n**${toSC("wrong")}: ${wrong|| "-"}**\n\`\`\`${stage}\`\`\``;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("choose letter"),
     buttons: letters.map(l=>({buttonId:`.hangman ${l}`, buttonText:{displayText:`${l.toUpperCase()}`}, type:1})),
     headerType:1
   },{quoted:m});
  }

  let guess = sub[0];
  if(!/^[a-z]$/.test(guess)) return await sock.sendMessage(chat,{text:`**${toSC("guess a letter")}.hangman a**`},{quoted:m});

  if(data.guessed.includes(guess) || data.wrong.includes(guess)){
   return await sock.sendMessage(chat,{text:`**⚠️ ${toSC("already guessed")} ${guess}**`},{quoted:m});
  }

  if(data.word.includes(guess)){
   data.guessed.push(guess);
  } else {
   data.wrong.push(guess);
  }
  saveDB(chat,data);

  let {display,wrong,stage}=render(data);

  // win check
  if(data.word.split("").every(c=> data.guessed.includes(c))){
   let cap=`**🎉 ${toSC("you won! word")}: ${data.word}**\n\n**${display}**\n\n> ${toSC("powered by storm")} 𝐗`;
   delDB(chat);
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("victory"),
     buttons:[
       {buttonId:`.hangman start`, buttonText:{displayText:`🔁 ${toSC("play again")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(data.wrong.length>=6){
   let cap=`**💀 ${toSC("you lost! word was")} ${data.word}**\n\n\`\`\`${stage}\`\`\`\n\n> ${toSC("powered by storm")} 𝐗`;
   delDB(chat);
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("game over"),
     buttons:[
       {buttonId:`.hangman start`, buttonText:{displayText:`🔁 ${toSC("play again")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  let cap=`**${data.word.includes(guess)? "✅ "+toSC("correct!") : "❌ "+toSC("wrong!")} ${guess.toUpperCase()}**\n\n`;
  cap+=`**📝 ${display}**\n`;
  cap+=`**❌ ${wrong|| "-"} | ❤️ ${6-data.wrong.length}**\n`;
  cap+=`\`\`\`${stage}\`\`\`\n\n> ${toSC("powered by storm")} 𝐗`;

  // dynamic buttons: show unguessed letters
  let alphabet="abcdefghijklmnopqrstuvwxyz".split("").filter(l=>!data.guessed.includes(l)&&!data.wrong.includes(l));
  let btnLetters = alphabet.slice(0,3);
  let btns = btnLetters.map(l=>({buttonId:`.hangman ${l}`, buttonText:{displayText:`${l.toUpperCase()}`}, type:1}));
  btns.push({buttonId:`.hangman flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1});

  await sock.sendMessage(chat,{
    text:cap,
    footer: toSC("guess next"),
    buttons: btns,
    headerType:1
  },{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
