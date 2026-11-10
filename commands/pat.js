function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

export default{
name:"pat",
aliases:["pats","headpat"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🥰",key:m.key}});
  let mentions=m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  let isFlip=args.includes("flip")||args.includes("rotate");
  let sub=args[0]?.toLowerCase()||"";

  let sender=m.sender;
  let target=mentions[0] || (m.isGroup? null : m.chat);

  if(sub==="board"){
   return await sock.sendMessage(m.chat,{text:`**╭─❍ ${toSC("pat board")} ❍─**\n**│ 🥰.pat @user**\n**│ 🔄 flip - reverse pat**\n**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});
  }

  // fetch pat gif
  let gif="https://i.waifu.pics/";
  try{
   let r=await fetch("https://api.waifu.pics/sfw/pat");
   let j=await r.json();
   gif=j.url;
  }catch{ gif="https://i.waifu.pics/pat.gif"; }

  let cap="";
  let from=sender.split("@")[0];
  let to=target? target.split("@")[0] : "everyone";

  if(!target){
   cap=`**🥰 @${from} ${toSC("pats everyone softly")}**\n\n> ${toSC("powered by storm")} 𝐗`;
  } else if(isFlip){
   cap=`**🥰 @${to} ${toSC("pats")} @${from} ${toSC("back")} (🔄 ${toSC("flipped")})**\n\n> ${toSC("powered by storm")} 𝐗`;
  } else {
   cap=`**🥰 @${from} ${toSC("pats")} @${to} ${toSC("head")}**\n\n> ${toSC("powered by storm")} 𝐗`;
  }

  await sock.sendMessage(m.chat,{
    video:{url:gif},
    gifPlayback:true,
    caption:cap,
    mentions: target? [sender,target] : [sender],
    footer: toSC("pat pat"),
    buttons:[
      {buttonId:`.pat @${to}`, buttonText:{displayText:`🥰 ${toSC("pat again")}`}, type:1},
      {buttonId:`.pat flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
      {buttonId:`.pat board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1}
    ],
    headerType:4
  },{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
