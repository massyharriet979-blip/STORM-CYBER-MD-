import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

function getDB(chat){ let p=`./database/math_${chat}.json`; if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p)); return null; }
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/math_${chat}.json`,JSON.stringify(d)); }

function genQuestion(level){
 let a,b,op,ans,q;
 if(level==="easy"){
  a=Math.floor(Math.random()*20)+1; b=Math.floor(Math.random()*20)+1;
  let ops=["+","-","*"]; op=ops[Math.floor(Math.random()*3)];
  if(op==="+"){ans=a+b; q=`${a} + ${b}`;}
  if(op==="-"){ans=a-b; q=`${a} - ${b}`;}
  if(op==="*"){ans=a*b; q=`${a} × ${b}`;}
 } else if(level==="medium"){
  a=Math.floor(Math.random()*50)+1; b=Math.floor(Math.random()*20)+1;
  let ops=["*","/","+","-"]; op=ops[Math.floor(Math.random()*4)];
  if(op==="+"){ans=a+b; q=`${a} + ${b}`;}
  if(op==="-"){ans=a-b; q=`${a} - ${b}`;}
  if(op==="*"){ans=a*b; q=`${a} × ${b}`;}
  if(op==="/"){ b=Math.floor(Math.random()*10)+1; a=b*(Math.floor(Math.random()*10)+1); ans=a/b; q=`${a} ÷ ${b}`;}
 } else {
  a=Math.floor(Math.random()*100)+1; b=Math.floor(Math.random()*50)+1;
  let ops=["*","/","^","%"]; op=ops[Math.floor(Math.random()*4)];
  if(op==="*"){ans=a*b; q=`${a} × ${b}`;}
  if(op==="/"){ b=Math.floor(Math.random()*20)+1; a=b*(Math.floor(Math.random()*12)+1); ans=a/b; q=`${a} ÷ ${b}`;}
  if(op==="^"){ a=Math.floor(Math.random()*12)+1; b=2; ans=a*a; q=`${a}²`;}
  if(op==="%"){ ans=a%b; q=`${a} mod ${b}`;}
 }
 return {q, ans};
}

export default{
name:"math",
aliases:["maths","quiz"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🧮",key:m.key}});
  let chat=m.chat;
  let data=getDB(chat);
  let sub=args[0]?.toLowerCase() || "start";

  if(!data || sub==="start" || sub==="new" || sub==="next"){
   let level=data?.level||"easy";
   let {q,ans}=genQuestion(level);
   data={q,ans,level,tries:0,flip:false,page:0};
   saveDB(chat,data);
   let cap=`**╭─❍ ${toSC("math quiz")} [${toSC(level)}] ❍─**\n`;
   cap+=`**│ 🧮 ${q} =?**\n`;
   cap+=`**│**\n**│ ✏️.math 42**\n`;
   cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("solve it"),
     buttons:[
       {buttonId:`.math board`, buttonText:{displayText:`💡 ${toSC("hint")}`}, type:1},
       {buttonId:`.math next`, buttonText:{displayText:`⏭️ ${toSC("next")}`}, type:1},
       {buttonId:`.math flip`, buttonText:{displayText:`🔄 ${toSC("flip level")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub==="flip" || sub==="rotate"){
   let levels=["easy","medium","hard"];
   let idx=levels.indexOf(data.level);
   let next=levels[(idx+1)%levels.length];
   let {q,ans}=genQuestion(next);
   data={q,ans,level:next,tries:0,flip:!data.flip,page:(data.page+1)%3};
   saveDB(chat,data);
   let cap=`**🔄 ${toSC("flipped to")} ${toSC(next)}**\n\n**🧮 ${q} =?**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC(`level ${next}`),
     buttons:[
       {buttonId:`.math board`, buttonText:{displayText:`💡 ${toSC("hint")}`}, type:1},
       {buttonId:`.math flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
       {buttonId:`.math next`, buttonText:{displayText:`⏭️ ${toSC("next")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub==="board" || sub==="hint"){
   let hint = data.ans.toString().length>1? `${data.ans.toString()[0]}...${data.ans.toString().length} digits` : `between ${data.ans-2} and ${data.ans+2}`;
   return await sock.sendMessage(chat,{
     text:`**💡 ${toSC("hint")}: ${hint}**\n\n**🧮 ${data.q} =?**`,
     footer: toSC("hint"),
     buttons:[
       {buttonId:`.math answer`, buttonText:{displayText:`👁️ ${toSC("answer")}`}, type:1},
       {buttonId:`.math flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub==="answer"){
   let cap=`**👁️ ${toSC("answer")}: ${data.q} = ${data.ans}**\n\n> ${toSC("powered by storm")} 𝐗`;
   let {q,ans}=genQuestion(data.level);
   data={q,ans,level:data.level,tries:0,flip:data.flip,page:data.page};
   saveDB(chat,data);
   return await sock.sendMessage(chat,{
     text:cap+`\n\n**⏭️ ${toSC("next")}: ${q} =?**`,
     footer: toSC("answer revealed"),
     buttons:[
       {buttonId:`.math flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
       {buttonId:`.math board`, buttonText:{displayText:`💡 ${toSC("hint")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  // check numeric answer
  let guess=parseFloat(args.join(" "));
  if(isNaN(guess)) return await sock.sendMessage(chat,{text:`**✏️ ${toSC("send number")}.math 42**\n\n**🧮 ${data.q} =?**`},{quoted:m});

  data.tries++;
  saveDB(chat,data);
  if(guess===data.ans){
   let cap=`**🎉 ${toSC("correct!")} ${data.q} = ${data.ans}**\n**🏆 ${toSC("in")} ${data.tries} ${toSC("tries")}**\n\n> ${toSC("powered by storm")} 𝐗`;
   let {q,ans}=genQuestion(data.level);
   data={q,ans,level:data.level,tries:0,flip:data.flip,page:data.page};
   saveDB(chat,data);
   return await sock.sendMessage(chat,{
     text:cap+`\n\n**⏭️ ${toSC("next")}: ${q} =?**`,
     footer: toSC("you solved it"),
     buttons:[
       {buttonId:`.math board`, buttonText:{displayText:`💡 ${toSC("hint")}`}, type:1},
       {buttonId:`.math flip`, buttonText:{displayText:`🔄 ${toSC("flip level")}`}, type:1},
       {buttonId:`.math next`, buttonText:{displayText:`⏭️ ${toSC("next")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  } else {
   return await sock.sendMessage(chat,{
     text:`**❌ ${toSC("wrong!")} ${guess} ≠ ${toSC("answer")}**\n\n**🧮 ${data.q} =? [${toSC("try")} ${data.tries}]**`,
     footer: toSC("try again"),
     buttons:[
       {buttonId:`.math board`, buttonText:{displayText:`💡 ${toSC("hint")}`}, type:1},
       {buttonId:`.math flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
       {buttonId:`.math answer`, buttonText:{displayText:`👁️ ${toSC("answer")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
