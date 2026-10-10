function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const COMPS=[
 "You light up the room instantly ✨",
 "Your smile is literally magic 😊",
 "You're smarter than you think 🧠",
 "You have the best energy ⚡",
 "You're one of a kind 💎",
 "Your vibe is unmatched 🔥",
 "You make everyone better 🌟",
 "You're insanely talented 🎨",
 "Your heart is pure gold 💛",
 "You inspire without trying 🚀",
 "You're beautiful inside out 🌹",
 "Your laugh is contagious 😂",
 "You're a walking W 💯",
 "You got that main character energy 🎬",
 "Storm gang loves you 💙"
];

export default{
name:"compliment",
aliases:["comp","praise","nice"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"💖",key:m.key}});
  let mentions=m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  let target=mentions[0] || m.sender;
  let tag=target.split("@")[0];
  let from=m.sender.split("@")[0];

  let pick=COMPS[Math.floor(Math.random()*COMPS.length)];

  let cap=`**╭─❍ ${toSC("compliment")} ❍─**\n`;
  if(m.sender===target){
   cap+=`**│ 💖 @${tag}, ${pick}**\n`;
  }else{
   cap+=`**│ 💖 @${from} ➜ @${tag}**\n`;
   cap+=`**│ ✨ ${pick}**\n`;
  }
  cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;

  await sock.sendMessage(m.chat,{text:cap, mentions:[m.sender,target]},{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
