const { translateText } = require('../lib/translate');
const axios=require('axios');

module.exports={
name:"anime",
aliases:["animu","animepic","waifu"],
execute: async(sock,m,args)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   let type=(args[0]||"waifu").toLowerCase();
   let valid=["waifu","neko","shinobu","megumin","bully","cuddle","cry","hug","awoo","kiss","lick","pat","smug","bonk","yeet","blush","smile","wave","highfive","handhold","nom","bite","glomp","slap","kill","kick","happy","wink","poke","dance","cringe"];

   if(!valid.includes(type)) type="waifu";

   await sock.sendMessage(m.chat,{react:{text:"✨",key:m.key}});

   let api=`https://api.waifu.pics/sfw/${type}`;
   let res=await axios.get(api);
   let url=res.data.url;

   let caption=`
╭─❍ ${toSC("anime")} ❍─
│
│ ✨ ${toSC("type")}: ${type}
│
╰────────────────
> ${toSC("powered by storm")} 𝐗
`.trim();

   await sock.sendMessage(m.chat,{
     image:{url},
     caption: await t(caption),
     contextInfo:{
       forwardingScore:999,
       isForwarded:true,
       forwardedNewsletterMessageInfo:{
         newsletterJid:"120363414065055650@newsletter",
         newsletterName:"STORM ANIME",
         serverMessageId:1
       }
     }
   },{quoted:m});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
