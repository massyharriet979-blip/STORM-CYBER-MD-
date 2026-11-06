function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

function getCompat(a,b){
 let hash=(a+b).split("").reduce((x,c)=>x+c.charCodeAt(0),0);
 return (hash*7)%101;
}

export default{
name:"ship",
aliases:["shipping","love"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"💘",key:m.key}});
  let mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  let isFlip = args.includes("flip")||args.includes("rotate");

  let user1 = m.sender;
  let user2 = mentions[0] || (args[0]?.includes("@")? args[0].replace("@","")+"@s.whatsapp.net" : null);

  if(!user2){
   let groupMeta = m.isGroup? await sock.groupMetadata(m.chat) : null;
   let participants = groupMeta?.participants?.map(p=>p.id) || [];
   let random = participants.filter(id=>id!==user1);
   user2 = random[Math.floor(Math.random()*random.length)] || user1;
  }

  if(isFlip){
   [user1, user2] = [user2, user1];
  }

  let name1 = user1.split("@")[0];
  let name2 = user2.split("@")[0];
  let score = getCompat(name1,name2);

  let bar = "█".repeat(Math.floor(score/10)) + "░".repeat(10-Math.floor(score/10));
  let status = score>80? "💍 soulmates" : score>60? "💞 perfect match" : score>40? "💕 good" : score>20? "💔 low" : "☠️ no chance";

  let cap=`**╭─❍ ${toSC("ship meter")} ❍─**\n`;
  cap+=`**│ 💘 @${name1} + @${name2}**\n`;
  cap+=`**│**\n`;
  cap+=`**│ ${bar} ${score}%**\n`;
  cap+=`**│ ${status}**\n`;
  cap+=`**│**\n`;
  cap+=`**│ 🔄 ${toSC("flip to swap")}**\n`;
  cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;

  await sock.sendMessage(m.chat,{
    text:cap,
    mentions:[user1,user2],
    footer: toSC("ship - love tester"),
    buttons:[
      {buttonId:`.ship @${name2}`, buttonText:{displayText:`💘 ${toSC("ship again")}`}, type:1},
      {buttonId:`.ship flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
      {buttonId:`.ship board`, buttonText:{displayText:`🎯 ${toSC("random ship")}`}, type:1}
    ],
    headerType:1
  },{quoted:m});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
