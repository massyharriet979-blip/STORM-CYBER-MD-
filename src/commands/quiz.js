import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const QUESTIONS=[
{q:"What is the capital of Japan?", o:["Seoul","Tokyo","Beijing","Bangkok"], a:1},
{q:"Who painted Mona Lisa?", o:["Picasso","Van Gogh","Da Vinci","Monet"], a:2},
{q:"Largest planet in solar system?", o:["Earth","Mars","Jupiter","Saturn"], a:2},
{q:"What is 15 x 8?", o:["120","100","140","110"], a:0},
{q:"Which language runs in browser?", o:["Python","JavaScript","C++","Java"], a:1},
{q:"How many continents?", o:["5","6","7","8"], a:2},
{q:"Who is known as Father of Computers?", o:["Newton","Babbage","Tesla","Einstein"], a:1},
{q:"What does AI stand for?", o:["Auto Input","Artificial Intelligence","Auto Intel","Artificial Info"], a:1},
{q:"Fastest land animal?", o:["Lion","Cheetah","Tiger","Leopard"], a:1},
{q:"Year World War 2 ended?", o:["1944","1945","1946","1939"], a:1},
{q:"What is H2O?", o:["Oxygen","Water","Hydrogen","Salt"], a:1},
{q:"Which company made WhatsApp?", o:["Meta","Google","Microsoft","Apple"], a:0},
{q:"Binary of 10?", o:["1010","1000","1100","101"], a:0},
{q:"Most followed on Instagram?", o:["Ronaldo","Messi","Selena","Rock"], a:0},
{q:"What is 2^10?", o:["1000","1024","512","2048"], a:1},
{q:"Capital of France?", o:["London","Paris","Berlin","Rome"], a:1},
{q:"Who discovered gravity?", o:["Newton","Einstein","Galileo","Tesla"], a:0},
{q:"Largest ocean?", o:["Atlantic","Indian","Arctic","Pacific"], a:3},
{q:"HTML stands for?", o:["Hyper Text Markup Language","High Tech Modern Language","Hyper Transfer","None"], a:0},
{q:"How many sides in hexagon?", o:["5","6","7","8"], a:1}
];

function getDB(chat){
 let p=`./database/quiz_${chat}.json`;
 if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p));
 return null;
}
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/quiz_${chat}.json`,JSON.stringify(d)); }
function delDB(chat){ try{fs.unlinkSync(`./database/quiz_${chat}.json`);}catch{} }

export default{
name:"quiz",
aliases:["trivia","question"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🧠",key:m.key}});
  let chat=m.chat;
  let sub=args[0]?.toLowerCase() || "start";
  let data=getDB(chat);

  if(sub=="start" || sub=="new" ||!data){
   let qIdx = Math.floor(Math.random()*QUESTIONS.length);
   data={current:qIdx, score:{}, total:0, asked:[qIdx], flip:false};
   saveDB(chat,data);
  }

  if(sub=="stop" || sub=="end"){
   delDB(chat);
   return await sock.sendMessage(chat,{text:`**🏳️ ${toSC("quiz ended")}**\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});
  }

  if(sub=="flip" || sub=="next" || sub=="skip"){
   let available = QUESTIONS.map((_,i)=>i).filter(i=>!data.asked.includes(i));
   if(available.length===0) data.asked=[];
   let qIdx = available.length? available[Math.floor(Math.random()*available.length)] : Math.floor(Math.random()*QUESTIONS.length);
   data.current=qIdx;
   data.asked.push(qIdx);
   data.flip=!data.flip;
   saveDB(chat,data);
  }

  // answer handling
  if(["a","b","c","d","0","1","2","3"].includes(sub) || (args[1] && ["a","b","c","d"].includes(args[1]))){
   let ansMap={a:0,b:1,c:2,d:3,"0":0,"1":1,"2":2,"3":3};
   let chosen = ansMap[sub]?? ansMap[args[1]]?? -1;
   let currQ = QUESTIONS[data.current];
   let isCorrect = chosen===currQ.a;
   let user=m.sender;
   if(!data.score[user]) data.score[user]={correct:0, wrong:0};
   if(isCorrect) data.score[user].correct++; else data.score[user].wrong++;
   data.total++;

   let txt=`**${isCorrect? "✅ "+toSC("correct!") : "❌ "+toSC("wrong!")}**\n\n`;
   txt+=`**${toSC("correct answer")}: ${String.fromCharCode(65+currQ.a)}. ${currQ.o[currQ.a]}**\n\n`;
   // next question
   let available = QUESTIONS.map((_,i)=>i).filter(i=>!data.asked.includes(i));
   if(available.length===0) data.asked=[];
   let qIdx = available.length? available[Math.floor(Math.random()*available.length)] : Math.floor(Math.random()*QUESTIONS.length);
   data.current=qIdx;
   data.asked.push(qIdx);
   saveDB(chat,data);
   let nextQ = QUESTIONS[qIdx];

   let cap=txt+`**╭─❍ ${toSC("next question")} ❍─**\n`;
   cap+=`**│ 🧠 ${nextQ.q}**\n**│**\n`;
   nextQ.o.forEach((opt,i)=>{ cap+=`**│ ${String.fromCharCode(65+i)}. ${opt}**\n`; });
   cap+=`**╰────────────────**\n\n`;
   cap+=`**${toSC("score")}: @${user.split("@")[0]} ✅${data.score[user].correct} ❌${data.score[user].wrong}**\n`;
   cap+=`> ${toSC("powered by storm")} 𝐗`;

   return await sock.sendMessage(chat,{
     text:cap,
     mentions:[user],
     footer: toSC("choose answer"),
     buttons:[
       {buttonId:`.quiz a`, buttonText:{displayText:`🅰️ A`}, type:1},
       {buttonId:`.quiz b`, buttonText:{displayText:`🅱️ B`}, type:1},
       {buttonId:`.quiz c`, buttonText:{displayText:`©️ C`}, type:1},
       {buttonId:`.quiz d`, buttonText:{displayText:`🔤 D`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  // show current question
  let currQ = QUESTIONS[data.current];
  let cap=`**╭─❍ ${toSC("quiz game")} ❍─**\n`;
  cap+=`**│ 🧠 ${toSC("question")} ${data.total+1}: ${currQ.q}**\n**│**\n`;
  currQ.o.forEach((opt,i)=>{ cap+=`**│ ${String.fromCharCode(65+i)}. ${opt}**\n`; });
  cap+=`**╰────────────────**\n\n`;
  cap+=`> ${toSC("powered by storm")} 𝐗`;

  await sock.sendMessage(chat,{
    text:cap,
    footer: toSC("tap to answer + flip for next"),
    buttons:[
      {buttonId:`.quiz a`, buttonText:{displayText:`🅰️ A`}, type:1},
      {buttonId:`.quiz b`, buttonText:{displayText:`🅱️ B`}, type:1},
      {buttonId:`.quiz c`, buttonText:{displayText:`©️ C`}, type:1},
      {buttonId:`.quiz flip`, buttonText:{displayText:`🔄 ${toSC("flip next")}`}, type:1}
    ],
    headerType:1
  },{quoted:m});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
