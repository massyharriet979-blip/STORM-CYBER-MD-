import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const DICE_EMOJI=["","⚀","⚁","⚂","⚃","⚄","⚅"];
const DICE_EMOJI_2=["","🎲1️⃣","🎲2️⃣","🎲3️⃣","🎲4️⃣","🎲5️⃣","🎲6️⃣"];

function getDB(chat){
 let p=`./database/dice_${chat}.json`;
 if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p));
 return {flip:false, style:0, games:[]};
}
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/dice_${chat}.json`,JSON.stringify(d)); }

function roll(count=1){
 let r=[];
 for(let i=0;i<count;i++) r.push(Math.floor(Math.random()*6)+1);
 return r;
}

function renderDice(arr, style=0, flip=false){
 if(flip) arr = [...arr].reverse();
 let em = style===0? DICE_EMOJI : DICE_EMOJI_2;
 let txt = arr.map(n=>em[n]).join(" ");
 let sum = arr.reduce((a,b)=>a+b,0);
 return {txt,sum};
}

export default{
name:"dice",
aliases:["diceroll","roll"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🎲",key:m.key}});
  let chat=m.chat;
  let data=getDB(chat);
  let sub=args[0]?.toLowerCase() || "roll";

  if(sub=="flip" || sub=="rotate"){
   data.flip=!data.flip;
   data.style = data.style===0?1:0;
   saveDB(chat,data);
   let arr=roll(2);
   let {txt,sum}=renderDice(arr,data.style,data.flip);
   return await sock.sendMessage(chat,{
     text:`**🔄 ${toSC("dice flipped")} [${toSC(data.flip? "flip on" : "normal")}]**\n\n**${txt} = ${sum}**\n\n> ${toSC("powered by storm")} 𝐗`,
     footer: toSC("dice controls"),
     buttons:[
       {buttonId:`.dice roll`, buttonText:{displayText:`🎲 ${toSC("roll")}`}, type:1},
       {buttonId:`.dice roll 2`, buttonText:{displayText:`🎯 ${toSC("roll 2")}`}, type:1},
       {buttonId:`.dice duel`, buttonText:{displayText:`⚔️ ${toSC("duel")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="duel" || sub=="vs"){
   let target = m.mentionedJid?.[0] || null;
   let p1=m.sender;
   let r1=roll(1)[0];
   let r2=roll(1)[0];
   let winner=null;
   if(r1>r2) winner=p1;
   else if(r2>r1) winner=target;

   let txt=`**╭─❍ ${toSC("dice duel")} ❍─**\n`;
   txt+=`**│ 👤 @${p1.split("@")[0]} : ${DICE_EMOJI[r1]} (${r1})**\n`;
   if(target) txt+=`**│ 👤 @${target.split("@")[0]} : ${DICE_EMOJI[r2]} (${r2})**\n`;
   else txt+=`**│ 🤖 ${toSC("bot")} : ${DICE_EMOJI[r2]} (${r2})**\n`;
   txt+=`**│**\n`;
   if(r1===r2) txt+=`**│ 🤝 ${toSC("draw!")}**\n`;
   else if(winner) txt+=`**│ 🏆 ${toSC("winner")}: @${winner.split("@")[0]}**\n`;
   txt+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;

   return await sock.sendMessage(chat,{
     text:txt,
     mentions: target? [p1,target] : [p1],
     footer: toSC("dice duel"),
     buttons:[
       {buttonId:`.dice duel ${target? "@"+target.split("@")[0] : ""}`, buttonText:{displayText:`🔁 ${toSC("rematch")}`}, type:1},
       {buttonId:`.dice roll`, buttonText:{displayText:`🎲 ${toSC("roll")}`}, type:1},
       {buttonId:`.dice flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  // normal roll
  let count=1;
  if(!isNaN(parseInt(sub))) count=parseInt(sub);
  else if(args[1] &&!isNaN(parseInt(args[1]))) count=parseInt(args[1]);
  if(count>10) count=10;
  if(count<1) count=1;

  let arr=roll(count);
  let {txt,sum}=renderDice(arr,data.style,data.flip);

  let cap=`**╭─❍ ${toSC("dice rolled")} ❍─**\n`;
  cap+=`**│ 🎲 ${toSC("dice")}: ${txt}**\n`;
  cap+=`**│ 🔢 ${toSC("count")}: ${count}**\n`;
  cap+=`**│ ➕ ${toSC("total")}: ${sum}**\n`;
  if(count===1){
    if(arr[0]===6) cap+=`**│ 🎉 ${toSC("jackpot! you got 6")}**\n`;
    else if(arr[0]===1) cap+=`**│ 😭 ${toSC("oops 1")}**\n`;
  }
  cap+=`**╰────────────────**\n\n`;
  cap+=`**${toSC("flip")}**: ${data.flip? toSC("on") : toSC("off")} | **${toSC("style")}: ${data.style+1}**\n`;
  cap+=`> ${toSC("powered by storm")} 𝐗`;

  await sock.sendMessage(chat,{
    text:cap,
    footer: toSC("dice controls"),
    buttons:[
      {buttonId:`.dice roll ${count}`, buttonText:{displayText:`🎲 ${toSC("roll again")}`}, type:1},
      {buttonId:`.dice flip`, buttonText:{displayText:`🔄 ${toSC("flip rotate")}`}, type:1},
      {buttonId:`.dice duel`, buttonText:{displayText:`⚔️ ${toSC("duel")}`}, type:1}
    ],
    headerType:1
  },{quoted:m});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
