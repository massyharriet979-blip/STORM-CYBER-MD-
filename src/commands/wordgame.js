import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

function getDB(chat){ let p=`./database/word_${chat}.json`; if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p)); return null; }
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/word_${chat}.json`,JSON.stringify(d)); }

const WORDS={
 easy:["apple","mango","house","water","light","happy","storm","music","pizza","tiger","phone","smile","beach","dream","magic"],
 medium:["planet","garden","bridge","shadow","candle","thunder","journey","freedom","horizon","diamond","kitchen","library","voltage","monster","factory"],
 hard:["labyrinth","conundrum","epiphany","paradox","quixotic","serendipity","ubiquitous","eloquent","nostalgia","melancholy","ambiguous","catalyst","dichotomy","ephemeral","maverick"]
};

function shuffle(w){ return w.split("").sort(()=>Math.random()-0.5).join(""); }
function hintWord(w, tries){
 if(tries===0) return w[0]+"_".repeat(w.length-1)+` (${w.length} letters)`;
 if(tries===1) return w[0]+ "_".repeat(w.length-2)+w.slice(-1)+` (${w.length})`;
 return w.slice(0,2)+"_".repeat(w.length-3)+w.slice(-1);
}

function gen(level){
 let list=WORDS[level];
 let word=list[Math.floor(Math.random()*list.length)];
 let scrambled=shuffle(word);
 while(scrambled===word) scrambled=shuffle(word);
 return {word, scrambled};
}

export default{
name:"wordgame",
aliases:["word","anagram","scramble"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🔤",key:m.key}});
  let chat=m.chat;
  let data=getDB(chat);
  let sub=args[0]?.toLowerCase() || "start";

  if(!data || sub==="start" || sub==="next" || sub==="new"){
   let level=data?.level||"easy";
   let {word,scrambled}=gen(level);
   data={word,scrambled,level,tries:0,flip:false,page:0};
   saveDB(chat,data);
   let cap=`**╭─❍ ${toSC("word game")} [${toSC(level)}] ❍─**\n`;
   cap+=`**│ 🔤 ${scrambled.toUpperCase()}**\n`;
   cap+=`**│ ${toSC("unscramble it")}**\n**│**\n`;
   cap+=`**│ ✏️.wordgame storm**\n**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("unscramble"),
     buttons:[
       {buttonId:`.wordgame board`, buttonText:{displayText:`💡 ${toSC("hint")}`}, type:1},
       {buttonId:`.wordgame flip`, buttonText:{displayText:`🔄 ${toSC("flip level")}`}, type:1},
       {buttonId:`.wordgame next`, buttonText:{displayText:`⏭️ ${toSC("next")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub==="flip" || sub==="rotate"){
   let levels=["easy","medium","hard"];
   let idx=levels.indexOf(data.level);
   let next=levels[(idx+1)%levels.length];
   let {word,scrambled}=gen(next);
   data={word,scrambled,level:next,tries:0,flip:!data.flip,page:(data.page+1)%3};
   saveDB(chat,data);
   let cap=`**🔄 ${toSC("flipped to")} ${toSC(next)}**\n\n**🔤 ${scrambled.toUpperCase()}**\n**${toSC("unscramble")}**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC(`level ${next}`),
     buttons:[
       {buttonId:`.wordgame board`, buttonText:{displayText:`💡 ${toSC("hint")}`}, type:1},
       {buttonId:`.wordgame flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
       {buttonId:`.wordgame next`, buttonText:{displayText:`⏭️ ${toSC("next")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub==="board" || sub==="hint"){
   let h=hintWord(data.word, data.tries);
   return await sock.sendMessage(chat,{
     text:`**💡 ${toSC("hint")}: ${h}**\n\n**🔤 ${data.scrambled.toUpperCase()}**`,
     footer: toSC("hint"),
     buttons:[
       {buttonId:`.wordgame answer`, buttonText:{displayText:`👁️ ${toSC("answer")}`}, type:1},
       {buttonId:`.wordgame flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
       {buttonId:`.wordgame next`, buttonText:{displayText:`⏭️ ${toSC("skip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub==="answer"){
   let cap=`**👁️ ${toSC("answer")}: ${data.word.toUpperCase()}**\n\n> ${toSC("powered by storm")} 𝐗`;
   let {word,scrambled}=gen(data.level);
   data={word,scrambled,level:data.level,tries:0,flip:data.flip,page:data.page};
   saveDB(chat,data);
   return await sock.sendMessage(chat,{
     text:cap+`\n\n**⏭️ ${toSC("next")}: ${scrambled.toUpperCase()}**`,
     footer: toSC("revealed"),
     buttons:[
       {buttonId:`.wordgame flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
       {buttonId:`.wordgame board`, buttonText:{displayText:`💡 ${toSC("hint")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  let guess=args.join("").toLowerCase();
  if(!guess) return await sock.sendMessage(chat,{text:`**✏️ ${toSC("guess")}:.wordgame ${data.word}**`},{quoted:m});
  data.tries++; saveDB(chat,data);
  if(guess===data.word){
   let cap=`**🎉 ${toSC("correct!")} ${data.word.toUpperCase()}**\n**🏆 ${toSC("in")} ${data.tries} ${toSC("tries")}**\n\n> ${toSC("powered by storm")} 𝐗`;
   let {word,scrambled}=gen(data.level);
   data={word,scrambled,level:data.level,tries:0,flip:data.flip,page:data.page};
   saveDB(chat,data);
   return await sock.sendMessage(chat,{
     text:cap+`\n\n**⏭️ ${toSC("next")}: ${scrambled.toUpperCase()}**`,
     footer: toSC("you won"),
     buttons:[
       {buttonId:`.wordgame board`, buttonText:{displayText:`💡 ${toSC("hint")}`}, type:1},
       {buttonId:`.wordgame flip`, buttonText:{displayText:`🔄 ${toSC("flip level")}`}, type:1},
       {buttonId:`.wordgame next`, buttonText:{displayText:`⏭️ ${toSC("next")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  } else {
   return await sock.sendMessage(chat,{
     text:`**❌ ${toSC("wrong!")} ${guess.toUpperCase()} ≠**\n\n**🔤 ${data.scrambled.toUpperCase()} [${toSC("try")} ${data.tries}]**`,
     footer: toSC("try again"),
     buttons:[
       {buttonId:`.wordgame board`, buttonText:{displayText:`💡 ${toSC("hint")}`}, type:1},
       {buttonId:`.wordgame flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
       {buttonId:`.wordgame answer`, buttonText:{displayText:`👁️ ${toSC("answer")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
