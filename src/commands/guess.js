import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

function getDB(chat){
 let p=`./database/guess_${chat}.json`;
 if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p));
 return null;
}
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/guess_${chat}.json`,JSON.stringify(d)); }
function delDB(chat){ try{fs.unlinkSync(`./database/guess_${chat}.json`);}catch{} }

export default{
name:"guess",
aliases:["guessthenumber","numberguess"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🔢",key:m.key}});
  let chat=m.chat;
  let data=getDB(chat);
  let sub=args[0]?.toLowerCase();

  if(!data || sub=="start" || sub=="new" || sub=="flip" || sub=="rotate"){
   let num = Math.floor(Math.random()*100)+1;
   data={number:num, attempts:0, min:1, max:100, players:{}, flip: sub=="flip"|| sub=="rotate"?! (data?.flip) : false};
   saveDB(chat,data);
   let cap=`**╭─❍ ${toSC("guess the number")} ❍─**\n`;
   cap+=`**│ 🎯 ${toSC("i picked a number between")} 1-100**\n`;
   cap+=`**│ 🔢 ${toSC("guess with")}.guess 50**\n`;
   cap+=`**│ 🔄 ${toSC("flip")}: ${data.flip? toSC("hard 1-500") : toSC("easy 1-100")}**\n`;
   cap+=`**│**\n**│ 💡 ${toSC("i will tell you higher / lower")}**\n`;
   cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   if(data.flip){
     data.number = Math.floor(Math.random()*500)+1;
     data.max=500;
     saveDB(chat,data);
   }
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("guess controls"),
     buttons:[
       {buttonId:`.guess 50`, buttonText:{displayText:`🔢 50`}, type:1},
       {buttonId:`.guess flip`, buttonText:{displayText:`🔄 ${toSC("flip mode")}`}, type:1},
       {buttonId:`.guess stop`, buttonText:{displayText:`🏳️ ${toSC("stop")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="stop" || sub=="end"){
   delDB(chat);
   return await sock.sendMessage(chat,{text:`**🏳️ ${toSC("game stopped. number was")} ${data.number}**\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});
  }

  if(sub=="board" || sub=="hint"){
   return await sock.sendMessage(chat,{
     text:`**🔍 ${toSC("hint")}: ${toSC("between")} ${data.min} - ${data.max} | ${toSC("attempts")}: ${data.attempts}**\n\n> ${toSC("powered by storm")} 𝐗`,
     footer: toSC("guess"),
     buttons:[
       {buttonId:`.guess ${Math.floor((data.min+data.max)/2)}`, buttonText:{displayText:`🎯 ${toSC("guess mid")}`}, type:1},
       {buttonId:`.guess flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  let guess = parseInt(sub);
  if(isNaN(guess)){
   return await sock.sendMessage(chat,{text:`**${toSC("send number like")}.guess 50**\n\n**${toSC("range")}: ${data.min}-${data.max}**`},{quoted:m});
  }

  if(guess<data.min || guess>data.max){
   return await sock.sendMessage(chat,{text:`**⚠️ ${toSC("out of range")} ${data.min}-${data.max}**`},{quoted:m});
  }

  data.attempts++;
  let user=m.sender;
  if(!data.players[user]) data.players[user]=0;
  data.players[user]++;

  if(guess===data.number){
   let cap=`**🎉 ${toSC("correct!")} @${user.split("@")[0]} ${toSC("guessed")} ${data.number}**\n\n`;
   cap+=`**📊 ${toSC("attempts")}: ${data.attempts}**\n`;
   cap+=`**🏆 ${toSC("your tries")}: ${data.players[user]}**\n\n`;
   cap+=`**${toSC("new game starting")}...**\n\n> ${toSC("powered by storm")} 𝐗`;
   delDB(chat);
   await sock.sendMessage(chat,{
     text:cap,
     mentions:[user],
     footer: toSC("you won"),
     buttons:[
       {buttonId:`.guess start`, buttonText:{displayText:`🔁 ${toSC("play again")}`}, type:1},
       {buttonId:`.guess flip`, buttonText:{displayText:`🔄 ${toSC("flip hard mode")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
   return;
  }

  if(guess<data.number){
   data.min = Math.max(data.min, guess+1);
   saveDB(chat,data);
   return await sock.sendMessage(chat,{
     text:`**📈 ${guess} ${toSC("is too low! go higher")}**\n\n**${toSC("range now")}: ${data.min}-${data.max} | ${toSC("attempts")}: ${data.attempts}**\n\n> ${toSC("powered by storm")} 𝐗`,
     footer: toSC("higher"),
     buttons:[
       {buttonId:`.guess ${Math.floor((data.min+data.max)/2)}`, buttonText:{displayText:`⬆️ ${toSC("higher")}`}, type:1},
       {buttonId:`.guess board`, buttonText:{displayText:`🎯 ${toSC("hint")}`}, type:1},
       {buttonId:`.guess flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  } else {
   data.max = Math.min(data.max, guess-1);
   saveDB(chat,data);
   return await sock.sendMessage(chat,{
     text:`**📉 ${guess} ${toSC("is too high! go lower")}**\n\n**${toSC("range now")}: ${data.min}-${data.max} | ${toSC("attempts")}: ${data.attempts}**\n\n> ${toSC("powered by storm")} 𝐗`,
     footer: toSC("lower"),
     buttons:[
       {buttonId:`.guess ${Math.floor((data.min+data.max)/2)}`, buttonText:{displayText:`⬇️ ${toSC("lower")}`}, type:1},
       {buttonId:`.guess board`, buttonText:{displayText:`🎯 ${toSC("hint")}`}, type:1},
       {buttonId:`.guess flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

 }catch(e){
  await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
