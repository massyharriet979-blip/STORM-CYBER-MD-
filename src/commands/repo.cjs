module.exports={
name:"repo",
aliases:["sc","script","source","repository"],
execute: async(sock,m,args)=>{
 const toSC=(s)=>{const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')};
 try{
   await sock.sendMessage(m.chat,{react:{text:"📦",key:m.key}});

   const img = "https://files.catbox.moe/0bb8x1.jpg";
   const channelJid = "120363414065055650@newsletter";
   const channelLink = "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P";
   const repoLink = "https://github.com/STORM-X-TECH/STORM-CYBER-MD";

   let caption = `**╭───❍ ${toSC("storm cyber md repo")} ❍───╮**\n`+
`**│**\n`+
`**│ 🚀 ${toSC("bot name")} : storm cyber md**\n`+
`**│ 📦 ${toSC("repo link")} :** ${repoLink}\n`+
`**│ 🌟 ${toSC("star & fork the repo")}**\n`+
`**│ 👑 ${toSC("owner")} : storm x**\n`+
`**│ 🔗 ${toSC("version")} : v3.0.0**\n`+
`**│**\n`+
`**│ 📢 ${toSC("follow our whatsapp channel")}**\n`+
`**│ 🔗 ${channelLink}**\n`+
`**│**\n`+
`**╰───────────────────────────**\n\n`+
`> ${toSC("powered by storm")} 𝐗`;

   await sock.sendMessage(m.chat,{
     image:{url:img},
     caption:caption,
     contextInfo:{
       isForwarded:true,
       forwardedNewsletterMessageInfo:{
         newsletterJid: channelJid,
         newsletterName: "STORM CYBER MD",
         serverMessageId: 1
       },
       externalAdReply:{
         title: "STORM CYBER MD - REPO",
         body: "Tap to view channel",
         thumbnailUrl: img,
         sourceUrl: channelLink,
         mediaType: 1,
         renderLargerThumbnail: true
       }
     }
   },{quoted:m});

   // second message with view channel button text
   await sock.sendMessage(m.chat,{
     text: `**${toSC("tap below to view channel")} 👇**\n\n${channelLink}\n\n> ${toSC("follow for updates")}`,
   },{quoted:m});

 }catch(e){
   await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m});
 }
}
}
