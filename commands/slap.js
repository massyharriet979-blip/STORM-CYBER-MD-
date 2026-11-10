function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const SLAP_URL="https://files.catbox.moe/vvfba6.mp4";

export default{
name:"slap",
aliases:["slaps"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"👋",key:m.key}});
  let mentions=m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  let isFlip=args.includes("flip")||args.includes("rotate");
  let sub=args[0]?.toLowerCase()||"";

  let sender=m.sender;
  let target=mentions[0] || null;

  if(sub==="board"){
   return await sock.sendMessage(m.chat,{text:`**╭─❍ ${toSC("slap board")} ❍─**\n**│ 👋.slap @user**\n**│ 🔄 flip - reverse slap**\n**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});
  }

  let cap="";
  let from=sender.split("@")[0];
  let to=target? target.split("@")[0] : "everyone";

  if(!target){
   cap=`**👋 @${from} ${toSC("slaps everyone")}**\n\n> ${toSC("powered by storm")} 𝐗`;
  } else if(isFlip){
   cap=`**👋 @${to} ${toSC("slaps")} @${from} ${toSC("hard")} (🔄 ${toSC("flipped")})**\n\n> ${toSC("powered by storm")} 𝐗`;
  } else {
   cap=`**👋 @${from} ${toSC("slaps")} @${to} ${toSC("hard")} 😤**\n\n> ${toSC("powered by storm")} 𝐗`;
  }

  await sock.sendMessage(m.chat,{
    video:{url:SLAP_URL},
    gifPlayback:false,
    caption:cap,
    mentions: target? [sender,target] : [sender],
    footer: toSC("slap slap"),
    buttons:[
      {buttonId:`.slap @${to}`, buttonText:{displayText:`👋 ${toSC("slap again")}`}, type:1},
      {buttonId:`.slap flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
      {buttonId:`.slap board`, buttonText:{displayText:`🎯 ${toSC("board")}`}, type:1}
    ],
    headerType:4
  },{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
