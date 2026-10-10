const { translateText } = require('../lib/translate');

module.exports={
name:"owner",
aliases:["creator","cyber","stormowner"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   let caption=`
╭─❍ ${toSC("storm cyber owner")} ❍─
│
│ 👑 ${toSC("owner")}: ${toSC("storm x cyber")}
│ 📞 ${toSC("number")}: 256794110913
│ 🤖 ${toSC("bot name")}: ${toSC("storm x cyber md")}
│ ⚡ ${toSC("status")}: ${toSC("always online, powering the cyber world")}
│ 💬 ${toSC("motto")}: ${toSC("coding is art, hacking is passion")}
│ 🛡️ ${toSC("team")}: ${toSC("storm cyber tech")}
│
│ ${toSC("need help? ping me anytime")}
│ ${toSC("bots, tools, mods, all in one place")}
│
╰────────────────
> ${toSC("powered by storm")} 𝐗
`.trim();

   let translated=await t(caption);

   await sock.sendMessage(m.chat,{
     text: translated,
     footer: toSC("powered by storm x cyber"),
     templateButtons:[
       {
         index:1,
         urlButton:{
           displayText: toSC("view whatsapp channel"),
           url: "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P"
         }
       },
       {
         index:2,
         urlButton:{
           displayText: "Telegram",
           url: "https://t.me/STORMX666"
         }
       },
       {
         index:3,
         callButton:{
           displayText: toSC("call owner"),
           phoneNumber: "+256794110913"
         }
       },
       {
         index:4,
         urlButton:{
           displayText: toSC("follow channel"),
           url: "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P"
         }
       }
     ],
     contextInfo:{
       forwardingScore:999,
       isForwarded:true,
       forwardedNewsletterMessageInfo:{
         newsletterJid:"120363414065055650@newsletter",
         newsletterName:"STORM CYBER MD",
         serverMessageId:1
       },
       externalAdReply:{
         title: toSC("storm cyber md - official"),
         body: toSC("tap to follow channel"),
         thumbnailUrl: "https://i.ibb.co/your-logo.jpg",
         sourceUrl: "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P",
         mediaType:1,
         renderLargerThumbnail:true
       }
     }
   },{quoted:m});

   await sock.sendMessage(m.chat,{react:{text:"👑",key:m.key}});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
