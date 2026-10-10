function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const ANSWERS=[
"Yes, definitely","It is certain","Without a doubt","Yes","Most likely",
"Outlook good","Signs point to yes","Ask again later","Cannot predict now","Don't count on it",
"My reply is no","My sources say no","Very doubtful","No","Outlook not so good",
"Absolutely!","No way!","Maybe","100% yes","Never","Go for it!","Chances are high"
];

export default{
name:"8ball",
aliases:["8b","magicball"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🎱",key:m.key}});
  let q=args.join(" ");
  if(!q) return await sock.sendMessage(m.chat,{text:`**🎱 ${toSC("ask a question")}.8ball will i win?**`},{quoted:m});

  let ans=ANSWERS[Math.floor(Math.random()*ANSWERS.length)];
  let flip=args.includes("flip")||args.includes("rotate")? "🔄" : "🎱";

  let txt=`**╭─❍ ${toSC("magic 8ball")} ❍─**\n`;
  txt+=`**│ ❓ ${toSC("question")}: ${q}**\n`;
  txt+=`**│**\n`;
  txt+=`**│ ${flip} ${toSC("answer")}: ${toSC(ans)}**\n`;
  txt+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;

  await sock.sendMessage(m.chat,{
    text:txt,
    footer: toSC("8ball controls"),
    buttons:[
      {buttonId:`.8ball ${q}`, buttonText:{displayText:`🔁 ${toSC("shake again")}`}, type:1},
      {buttonId:`.8ball flip ${q}`, buttonText:{displayText:`🔄 ${toSC("flip rotate")}`}, type:1},
      {buttonId:`.8ball will i be rich?`, buttonText:{displayText:`🎲 ${toSC("random q")}`}, type:1}
    ],
    headerType:1
  },{quoted:m});
 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
