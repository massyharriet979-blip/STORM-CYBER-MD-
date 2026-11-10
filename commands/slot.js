function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const THEMES={
 classic: ["🍒","🍋","🍊","🍇","💎","7️⃣"],
 fruit: ["🍎","🍌","🍓","🥝","🍑","💰"],
 animal: ["🐶","🐱","🦊","🐻","🐼","👑"]
};

function spin(theme){
 let reels=THEMES[theme];
 return [0,1,2].map(()=> reels[Math.floor(Math.random()*reels.length)]);
}

export default{
name:"slot",
aliases:["slots","spin"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🎰",key:m.key}});
  let sub=args[0]?.toLowerCase() || "classic";
  let themes=Object.keys(THEMES);
  let theme = themes.includes(sub)? sub : "classic";
  let flip = args.includes("flip")||args.includes("rotate");

  if(flip){
   let idx=themes.indexOf(theme);
   theme=themes[(idx+1)%themes.length];
  }

  if(sub=="board" || sub=="paytable"){
   let cap=`**🎰 ${toSC("paytable")} [${theme}]**\n\n`;
   cap+=`**💎💎💎 = ${toSC("jackpot x50")}**\n`;
   cap+=`**7️⃣7️⃣7️⃣ = ${toSC("jackpot x30")}**\n`;
   cap+=`**🍒🍒🍒 = x10 | ${toSC("any 3 same")} = x5**\n`;
   cap+=`**${toSC("any 2 same")} = x2**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(m.chat,{text:cap},{quoted:m});
  }

  let result = spin(theme);
  let isJackpot = result[0]===result[1]&&result[1]===result[2];
  let isTwo = result[0]===result[1]||result[1]===result[2]||result[0]===result[2];
  let win=0; let msg="";
  if(isJackpot){
   if(result[0]==="💎"||result[0]==="💰"||result[0]==="👑") win=50;
   else if(result[0]==="7️⃣") win=30;
   else win=10;
   msg=`🎉 ${toSC("jackpot!")} x${win}`;
  } else if(isTwo){
   win=2; msg=`✨ ${toSC("small win")} x2`;
  } else {
   msg=`💔 ${toSC("you lost")}`;
  }

  let cap=`**╭─❍ ${toSC("slot machine")} [${theme}] ❍─**\n`;
  cap+=`**│**\n`;
  cap+=`**│ | ${result[0]} | ${result[1]} | ${result[2]} |**\n`;
  cap+=`**│**\n`;
  cap+=`**│ ${msg}**\n`;
  cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;

  await sock.sendMessage(m.chat,{
    text:cap,
    footer: toSC(`theme: ${theme}`),
    buttons:[
      {buttonId:`.slot ${theme}`, buttonText:{displayText:`🎰 ${toSC("spin again")}`}, type:1},
      {buttonId:`.slot flip`, buttonText:{displayText:`🔄 ${toSC("flip theme")}`}, type:1},
      {buttonId:`.slot board`, buttonText:{displayText:`🎯 ${toSC("paytable")}`}, type:1}
    ],
    headerType:1
  },{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
