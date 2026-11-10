function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"botinfo",
alias:["info","infobot","about","scinfo"],
execute: async(sock, m, args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"⚡",key:m.key}}).catch(()=>{})

  const thumb = "https://files.catbox.moe/pznw3z.jpg"
  const channelJid = "120363414065055650@newsletter"
  const channelLink = "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P"

  // created 3 months ago
  const created = "3 months ago"
  const uptime = process.uptime()
  const d = Math.floor(uptime/86400)
  const h = Math.floor((uptime%86400)/3600)
  const mm = Math.floor((uptime%3600)/60)

  let caption=`
╭══〘 ⚡ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 〙══⊷❍
┃
┃ 🤖 ${toSmallCaps("name: storm cyber md")}
┃ 📅 ${toSmallCaps(`created: ${created}`)}
┃ ⏱️ ${toSmallCaps(`uptime: ${d}d ${h}h ${mm}m`)}
┃ 👑 ${toSmallCaps("owner: storm x")}
┃ 💻 ${toSmallCaps("base: baileys multi device")}
┃ 🔥 ${toSmallCaps("version: 1.0.0 cyber")}
┃ 📦 ${toSmallCaps("commands: 300+")}
┃ 🛡️ ${toSmallCaps("mode: quantum cyber")}
┃
┃ 📢 ${toSmallCaps("official channel:")}
┃ ${channelLink}
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
     body:`CREATED ${created.toUpperCase()} | POWERED BY STORM X`,
     thumbnailUrl:thumb,
     sourceUrl:channelLink,
     mediaType:1,
     renderLargerThumbnail:true
    }
   }
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
