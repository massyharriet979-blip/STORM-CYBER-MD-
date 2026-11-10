function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const NEWS="120363414065055650@newsletter";
const CHAN="https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P";

const GAMES={
 car:["🚗 Car Parking Multiplayer","🏎️ Real Racing 3","🚓 GTA SA","🏁 Asphalt 9","🚙 BeamNG Drive"],
 bicycle:["🚲 BMX Freestyle","🚴 Tour de France 2023","🚲 Descenders","🚴 Cycling Manager"],
 lorry:["🚚 Euro Truck Simulator 2","🚛 Truckers of Europe 3","🚚 World Truck Driving","🚛 Grand Truck Simulator"],
 bike:["🏍️ MotoGP 23","🏍️ Traffic Rider","🏍️ MX Bikes","🏍️ Bike Race Pro"]
};

export default{
name:"gamers",
aliases:["games","enginegames","racing"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🎮",key:m.key}});
  let sub=args[0]?.toLowerCase()||"board";
  let flip=args.includes("flip")||args.includes("rotate");

  if(sub==="board"||sub==="list"||sub==="all"){
   let cap=`**╭─❍ ${toSC("engine gamers board")} ❍─**\n`;
   cap+=`**│ 🎮 ${toSC("choose engine game")}**\n**│**\n`;
   cap+=`**│ 🚗 car - 5 ${toSC("games")}**\n`;
   cap+=`**│ 🚲 bicycle - 4 ${toSC("games")}**\n`;
   cap+=`**│ 🚚 lorry - 4 ${toSC("games")}**\n`;
   cap+=`**│ 🏍️ bike - 4 ${toSC("games")}**\n`;
   cap+=`**│**\n`;
   cap+=`**│ 👁️ ${toSC("view channel for more")}**\n`;
   cap+=`**╰────────────────**\n\n`;
   cap+=`**📢 ${NEWS}**\n**🔗 ${CHAN}**\n\n> ${toSC("powered by storm")} 𝐗`;

   return await sock.sendMessage(m.chat,{
     text:cap,
     footer: toSC("engine games"),
     buttons:[
       {buttonId:`.gamers car`, buttonText:{displayText:`🚗 ${toSC("car")}`}, type:1},
       {buttonId:`.gamers bicycle`, buttonText:{displayText:`🚲 ${toSC("bicycle")}`}, type:1},
       {buttonId:`.gamers lorry`, buttonText:{displayText:`🚚 ${toSC("lorry")}`}, type:1},
       {buttonId:`.gamers bike`, buttonText:{displayText:`🏍️ ${toSC("bike")}`}, type:1},
       {buttonId:`.gamers channel`, buttonText:{displayText:`👁️ ${toSC("view channel")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub==="channel"||sub==="view"){
   let cap=`**👁️ ${toSC("view our channel")}**\n\n**🔗 ${CHAN}**\n**📢 ${NEWS}**\n\n> ${toSC("tap to open")} ⬆️`;
   return await sock.sendMessage(m.chat,{
     text:cap,
     footer: toSC("channel"),
     buttons:[
       {buttonId:CHAN, buttonText:{displayText:`🔗 ${toSC("open channel")}`}, type:1},
       {buttonId:`.gamers board`, buttonText:{displayText:`🎮 ${toSC("games board")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(GAMES[sub]){
   let list=GAMES[sub].map((g,i)=>`**│ ${i+1}. ${g}**`).join("\n");
   let cap=`**╭─❍ ${toSC(sub+" games")} ❍─**\n`;
   cap+=`${list}\n`;
   cap+=`**│**\n**│ 🔄 ${toSC("flip to next category")}**\n`;
   cap+=`**╰────────────────**\n\n**🔗 ${CHAN}**\n\n> ${toSC("powered by storm")} 𝐗`;

   // auto post to newsletter
   try{ await sock.sendMessage(NEWS,{text:cap+`\n\n${CHAN}`}); }catch{}

   // rotate order
   let cats=Object.keys(GAMES);
   let idx=cats.indexOf(sub);
   let next=cats[(idx+1)%cats.length];

   return await sock.sendMessage(m.chat,{
     text:cap,
     footer: toSC(`${sub} games - ${flip?"flipped":""}`),
     buttons:[
       {buttonId:`.gamers ${next}`, buttonText:{displayText:`🔄 ${toSC("flip")} ➜ ${toSC(next)}`}, type:1},
       {buttonId:`.gamers board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1},
       {buttonId:`.gamers channel`, buttonText:{displayText:`👁️ ${toSC("view channel")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  // unknown -> board
  return await sock.sendMessage(m.chat,{text:`**Use.gamers board**\n**Options: car, bicycle, lorry, bike**\n\n${CHAN}`},{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
