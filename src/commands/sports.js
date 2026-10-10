function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const NEWSLETTER_JID = "120363414065055650@newsletter";
const CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P";

export default{
name:"sports",
aliases:["sport","games","sportmenu"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🏆",key:m.key}});

  let menu=`**╭─❍ ${toSC("storm sports hub")} ❍─**\n`;
  menu+=`**│ 🏟️ ${toSC("welcome to sports center")}**\n`;
  menu+=`**│**\n`;
  menu+=`**│ ⚽ ${toSC("football")} -.football start**\n`;
  menu+=`**│ 🏏 ${toSC("cricket")} -.cricket start**\n`;
  menu+=`**│ ❌⭕ ${toSC("tictactoe")} -.tictactoe start**\n`;
  menu+=`**│ 🎯 ${toSC("guess")} -.guess start**\n`;
  menu+=`**│ 🎱 ${toSC("8ball")} -.8ball question**\n`;
  menu+=`**│ 🪓 ${toSC("hangman")} -.hangman start**\n`;
  menu+=`**│ 🧩 ${toSC("riddle")} -.riddle**\n`;
  menu+=`**│ 🎰 ${toSC("slot")} -.slot**\n`;
  menu+=`**│ 🪙 ${toSC("coinflip")} -.coinflip**\n`;
  menu+=`**│**\n`;
  menu+=`**│ 📢 ${toSC("newsletter")}: ${NEWSLETTER_JID}**\n`;
  menu+=`**╰────────────────**\n\n`;
  menu+=`**🔗 ${toSC("follow channel")}:**\n${CHANNEL_LINK}\n\n`;
  menu+=`> ${toSC("powered by storm")} 𝐗`;

  await sock.sendMessage(m.chat,{
    text:menu,
    footer: toSC("sports menu - tap to play"),
    buttons:[
      {buttonId:`.football start`, buttonText:{displayText:`⚽ ${toSC("football")}`}, type:1},
      {buttonId:`.cricket start`, buttonText:{displayText:`🏏 ${toSC("cricket")}`}, type:1},
      {buttonId:`.sports board`, buttonText:{displayText:`🎯 ${toSC("more games")}`}, type:1}
    ],
    headerType:1
  },{quoted:m});

  // if user wants board - second menu
  if(args[0]==="board"){
   let board=`**╭─❍ ${toSC("all sports games")} ❍─**\n`;
   board+=`**│ 1. ⚽.football left / center / right**\n`;
   board+=`**│ 2. 🏏.cricket 1-6**\n`;
   board+=`**│ 3. 🎰.slot flip**\n`;
   board+=`**│ 4. 🎯.guess 50**\n`;
   board+=`**│ 5. ❌.tictactoe 5**\n`;
   board+=`**│**\n**│ 🔄 ${toSC("use flip to change mode")}**\n`;
   board+=`**╰────────────────**\n\n> Follow: ${CHANNEL_LINK}`;

   await sock.sendMessage(m.chat,{
     text:board,
     footer: toSC("flip rotate included"),
     buttons:[
       {buttonId:`.tictactoe start`, buttonText:{displayText:`❌ ${toSC("tictactoe")}`}, type:1},
       {buttonId:`.slot`, buttonText:{displayText:`🎰 ${toSC("slot")}`}, type:1},
       {buttonId:`.guess start`, buttonText:{displayText:`🔢 ${toSC("guess")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});

   // optional: send to newsletter channel too
   try{
     await sock.sendMessage(NEWSLETTER_JID, {text: board + `\n\n> ${toSC("live from")} ${m.chat}`});
   }catch(e){ /* ignore if not admin */ }
  }

 }catch(e){
  await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
