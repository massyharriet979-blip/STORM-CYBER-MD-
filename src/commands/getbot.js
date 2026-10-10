function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"getbot",
alias:["getbots","getbotlink","botlink"],
execute: async(sock, m, args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🤖",key:m.key}}).catch(()=>{})

  const thumb = "https://files.catbox.moe/pznw3z.jpg"
  const channelJid = "120363414065055650@newsletter"
  const channelLink = "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P"
  const tgBot = "https://t.me/Cyber_advanced_md_bot"

  let caption=`
╭══〘 🤖 𝐆𝐄𝐓 𝐁𝐎𝐓 〙══⊷❍
┃
┃ ${toSmallCaps("get storm cyber md bot")}
┃
┃ 📢 ${toSmallCaps("channel:")}
┃ ${channelLink}
┃ 🆔 ${channelJid}
┃
┃ 🤖 ${toSmallCaps("telegram bot:")}
┃ ${tgBot}
┃
┃ ${toSmallCaps("follow channel for updates")}
┃
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm x")}
`

  await sock.sendMessage(m.chat,{
   image:{url:thumb},
   caption:caption.trim(),
   contextInfo:{
    forwardingScore:999,
    isForwarded:true,
    forwardedNewsletterMessageInfo:{
     newsletterJid: channelJid,
     newsletterName:"STORM CYBER MD",
     serverMessageId:1
    },
    externalAdReply:{
     title:"STORM CYBER MD",
     body:"POWERED BY STORM X",
     thumbnailUrl:thumb,
     sourceUrl:channelLink,
     mediaType:1,
     renderLargerThumbnail:true
    }
   }
  },{quoted:m})

  await sock.sendMessage(m.chat,{react:{text:"⚡",key:m.key}}).catch(()=>{})

 }catch(e){console.log(e)}
}
}
