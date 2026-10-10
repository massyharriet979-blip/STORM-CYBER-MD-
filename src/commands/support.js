const { translateText } = require('../lib/translate');

module.exports={
name:"support",
aliases:["helpcenter","contact","supportgroup","stormsupport"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   let caption=`
╭─❍ ${toSC("support center")} ❍─
│
│ ${toSC("need help or have questions")}?
│ ${toSC("join our official support")}
│
│ 💬 ${toSC("support group")}:
│ https://chat.whatsapp.com/DmTBXEl85ULEfAFasiXo9S?s=cl&p=a&mlu=0
│
│ 📢 ${toSC("channel")}:
│ https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P
│
│ 👑 ${toSC("owner")}: wa.me/256794110913
│
│ ${toSC("we reply within 24 hours")}
│
╰────────────────
> ${toSC("powered by storm")} 𝐗
`.trim();

   await sock.sendMessage(m.chat,{
     image:{url:"https://files.catbox.moe/0bb8x1.jpg"},
     caption: await t(caption),
     contextInfo:{
       forwardingScore:999,
       isForwarded:true,
       forwardedNewsletterMessageInfo:{
         newsletterJid:"120363414065055650@newsletter",
         newsletterName:"STORM CYBER MD",
         serverMessageId:1
       },
       externalAdReply:{
         title: toSC("storm cyber md support"),
         body: toSC("tap to follow channel"),
         thumbnailUrl:"https://files.catbox.moe/0bb8x1.jpg",
         sourceUrl:"https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P",
         mediaType:1,
         renderLargerThumbnail:true
       }
     }
   },{quoted:m});

   await sock.sendMessage(m.chat,{react:{text:"🛟",key:m.key}});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   await sock.sendMessage(m.chat,{text:await translateText(`Error: ${e.message}`,botNum)},{quoted:m})
 }
}
}
