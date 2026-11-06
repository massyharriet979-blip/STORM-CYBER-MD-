function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}
export default{
name:"coinflip",
aliases:["flipcoin","coin","flip","toss"],
execute: async(sock,m,args)=>{
 await sock.sendMessage(m.chat,{react:{text:"🪙",key:m.key}});
 let choice=args[0]?.toLowerCase();
 let flip=Math.random()<0.5?"heads":"tails";
 let win=null;
 if(choice==="heads"||choice==="h") win=flip==="heads";
 if(choice==="tails"||choice==="t") win=flip==="tails";
 let emoji=flip==="heads"?"👑":"🥈";
 let txt=`**╭─❍ ${toSC("coin flip")} ❍─**\n**│ ${emoji} ${toSC("result")}: ${toSC(flip)}**\n**│**\n`;
 if(choice) txt+=`**│ ${win? "✅ "+toSC("you win!") : "❌ "+toSC("you lose")} ${toSC("you guessed")} ${toSC(choice)}**\n`;
 else txt+=`**│ 💡.coinflip heads**\n`;
 txt+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
 await sock.sendMessage(m.chat,{
   text:txt,
   footer: toSC("flip controls"),
   buttons:[
     {buttonId:`.coinflip`, buttonText:{displayText:`🪙 ${toSC("flip again")}`}, type:1},
     {buttonId:`.coinflip heads`, buttonText:{displayText:`👑 ${toSC("heads")}`}, type:1},
     {buttonId:`.coinflip tails`, buttonText:{displayText:`🥈 ${toSC("tails")}`}, type:1}
   ],
   headerType:1
 },{quoted:m});
}
}
