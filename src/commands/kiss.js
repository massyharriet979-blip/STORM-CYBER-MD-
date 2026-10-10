function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const KISS_URL="https://files.catbox.moe/nhhm0k.mp4";

export default{
name:"kiss",
aliases:["kisses","kisss"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"😘",key:m.key}});
  let mentions=m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  let sender=m.sender;
  let target=mentions[0] || null;

  let from=sender.split("@")[0];
  let to=target? target.split("@")[0] : null;

  let txt="";
  if(!target) txt=`**😘 @${from} ${toSC("kisses everyone")}**\n\n> ${toSC("powered by storm")} 𝐗`;
  else txt=`**😘 @${from} ${toSC("kisses")} @${to} 💋**\n\n> ${toSC("powered by storm")} 𝐗`;

  // send sticker from mp4 link
  await sock.sendMessage(m.chat,{
    sticker:{url:KISS_URL},
    mentions: target? [sender,target] : [sender]
  },{quoted:m});

  // then caption text no button
  await sock.sendMessage(m.chat,{text:txt, mentions: target? [sender,target] : [sender]},{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
