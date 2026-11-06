function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

function calc(a,b){
 let h=(a+b).toLowerCase().split("").reduce((x,c)=>x+c.charCodeAt(0),0);
 return (h*13)%101;
}

export default{
name:"love",
aliases:["lovetest","affection"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"❤️",key:m.key}});
  let mentions=m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  let isFlip=args.includes("flip")||args.includes("rotate");
  let sub=args[0]?.toLowerCase() || "";

  let target = mentions[0] || m.sender;

  if(sub==="board"){
   let cap=`**╭─❍ ${toSC("love board")} ❍─**\n`;
   cap+=`**│ ❤️.love @user - ${toSC("test")}**\n`;
   cap+=`**│ 💘.ship @user - ${toSC("ship")}**\n`;
   cap+=`**│ 🔄 ${toSC("flip swaps energy")}**\n`;
   cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(m.chat,{text:cap},{quoted:m});
  }

  let me=m.sender;
  if(isFlip) [me,target]=[target,me];

  let s1=me.split("@")[0], s2=target.split("@")[0];
  let score=calc(s1,s2);
  let heart="❤️".repeat(Math.ceil(score/20)) + "🤍".repeat(5-Math.ceil(score/20));
  let msg=score>90? toSC("true love soulmates") : score>70? toSC("deep love") : score>50? toSC("nice crush") : score>30? toSC("friend zone") : toSC("cold heart");

  let cap=`**╭─❍ ${toSC("love tester")} ❍─**\n`;
  cap+=`**│ 👤 @${s1}**\n`;
  cap+=`**│ 💘 @${s2}**\n`;
  cap+=`**│**\n`;
  cap+=`**│ ${heart} ${score}%**\n`;
  cap+=`**│ 💬 ${msg}**\n`;
  cap+=`**│**\n**│ 🔄 ${toSC("flip to swap energy")}**\n`;
  cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;

  await sock.sendMessage(m.chat,{
    text:cap,
    mentions:[me,target],
    footer: toSC("love meter"),
    buttons:[
      {buttonId:`.love @${s2}`, buttonText:{displayText:`❤️ ${toSC("love again")}`}, type:1},
      {buttonId:`.love flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
      {buttonId:`.love board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1}
    ],
    headerType:1
  },{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
