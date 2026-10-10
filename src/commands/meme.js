function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const SOURCES=[
 "https://meme-api.com/gimme",
 "https://meme-api.com/gimme/dankmemes",
 "https://meme-api.com/gimme/wholesomememes"
];

export default{
name:"meme",
aliases:["memes","funny"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"😂",key:m.key}});
  let sub=args[0]?.toLowerCase() || "random";
  let themes=["random","dank","wholesome"];
  let theme = themes.includes(sub)? sub : "random";
  let flip = args.includes("flip")||args.includes("rotate");

  if(flip){
   let idx=themes.indexOf(theme);
   theme=themes[(idx+1)%themes.length];
  }

  if(sub==="board"){
   let cap=`**╭─❍ ${toSC("meme board")} ❍─**\n`;
   cap+=`**│ 😂 random**\n**│ 💀 dank**\n**│ ❤️ wholesome**\n`;
   cap+=`**│ 🔄 ${toSC("flip to change")}**\n**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(m.chat,{text:cap},{quoted:m});
  }

  let url = theme==="random"? SOURCES[0] : theme==="dank"? SOURCES[1] : SOURCES[2];
  let res = await fetch(url);
  let data = await res.json();
  let memeUrl = data.url;
  let title = data.title || "Meme";

  let cap=`**😂 ${title}**\n\n**📂 ${theme} | 🔄 ${toSC("flip to rotate")}**\n\n> ${toSC("powered by storm")} 𝐗`;

  await sock.sendMessage(m.chat,{
    image:{url:memeUrl},
    caption:cap,
    footer: toSC(`meme - ${theme}`),
    buttons:[
      {buttonId:`.meme ${theme}`, buttonText:{displayText:`⏭️ ${toSC("next")}`}, type:1},
      {buttonId:`.meme flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
      {buttonId:`.meme board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1}
    ],
    headerType:4
  },{quoted:m});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`**❌ ${toSC("failed to fetch meme")}**\n${e.message}`},{quoted:m});
 }
}
}
