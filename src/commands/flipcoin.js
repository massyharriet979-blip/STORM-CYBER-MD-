function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

export default{
name:"flipcoin",
aliases:["coinflip","coin","flip","toss"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🪙",key:m.key}});

  let choice = args[0]?.toLowerCase();
  let flip = Math.random()<0.5? "heads" : "tails";
  let emoji = flip==="heads"? "👑" : "🥈";
  let resultEmoji = flip==="heads"? "🪙 HEADS" : "🪙 TAILS";

  let win=null;
  if(choice==="heads" || choice==="h") win = flip==="heads";
  if(choice==="tails" || choice==="t") win = flip==="tails";

  let txt=`**╭─❍ ${toSC("coin flip")} ❍─**\n`;
  txt+=`**│ ${emoji} ${toSC("result")}: ${toSC(flip)}**\n`;
  txt+=`**│ 🎲 ${resultEmoji}**\n`;
  txt+=`**│**\n`;
  if(choice){
    if(win) txt+=`**│ ✅ ${toSC("you guessed")} ${toSC(choice)} - ${toSC("you win!")}**\n`;
    else txt+=`**│ ❌ ${toSC("you guessed")} ${toSC(choice)} - ${toSC("you lose")}**\n`;
  } else {
    txt+=`**│ 💡 ${toSC("tip")}:.flipcoin heads ${toSC("to guess")}**\n`;
  }
  txt+=`**╰────────────────**\n\n`;
  txt+=`> ${toSC("powered by storm")} 𝐗`;

  await sock.sendMessage(m.chat,{
    text:txt,
    footer: toSC("flip controls"),
    buttons:[
      {buttonId:`.flipcoin`, buttonText:{displayText:`🪙 ${toSC("flip again")}`}, type:1},
      {buttonId:`.flipcoin heads`, buttonText:{displayText:`👑 ${toSC("heads")}`}, type:1},
      {buttonId:`.flipcoin tails`, buttonText:{displayText:`🥈 ${toSC("tails")}`}, type:1}
    ],
    headerType:1
  },{quoted:m});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
