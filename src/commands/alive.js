const fs=require('fs')
let start=Date.now()
module.exports={
name:"alive",
aliases:["uptime","bot","status"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let push=m.pushName||"User"

  // uptime
  let sec=Math.floor((Date.now()-start)/1000)
  // try read global start if exists from index - use file mtime fallback
  try{
    let stat=fs.statSync("./src/commands/alive.js")
    // use process uptime instead for better
    sec=Math.floor(process.uptime())
  }catch{}
  let h=Math.floor(sec/3600)
  let mm=Math.floor((sec%3600)/60)
  let s=sec%60
  let uptime=`${h}h ${mm}m ${s}s`

  // mode
  let mode="public"
  try{
    let f=`./database/mode_${botId}.json`
    if(fs.existsSync(f)){
      let j=JSON.parse(fs.readFileSync(f))
      if(j.mode) mode=j.mode
    }
  }catch{}

  let owner="𝐒𝐓𝐎𝐑𝐌 𝐗"
  let creator="GHOST AI"

  let caption=`╭━─━─━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 ❱─━─━─━─━╮
┃
┃ 𝐎𝐖𝐍𝐄𝐑: 『${owner}』
┃ 𝐔𝐒𝐄𝐑: @${push.replace(/@/g,"")}
┃ 𝐔𝐏𝐓𝐈𝐌𝐄: ${uptime}
┃ CREATOR: 「${creator}」
┃ 𝐌𝐎𝐃𝐄: ${mode}
┃ SESSIONS: ACTIVE
╰══════════════════════
╭══════════════════════
┃CONTACT OWNER : https://t.me/STORMX666
┃
┃
╰━─━─━─━─━─━─━╯

╭─❍ 𝐀𝐋𝐈𝐕𝐄 𝐓𝐄𝐗𝐓 ❍─
│ 𝐂𝐑𝐄𝐀𝐓𝐎𝐑: 𝐒𝐓𝐎𝐑𝐌 𝐗 𝐓𝐇𝐄 𝐋𝐄𝐆𝐄𝐍𝐃
│ 𝐏𝐀𝐈𝐑 𝐖𝐈𝐓𝐇 𝐓𝐇𝐄 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 𝐁𝐎𝐓
│ 𝐀𝐍𝐃 𝐖𝐀𝐈𝐓 𝐅𝐎𝐑 𝐔𝐏𝐃𝐀𝐓𝐄𝐒.
╰───────────────❍

╭─❍ 𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐒𝐒𝐀𝐆𝐄 ❍─
│ 𝐈 𝐀𝐌 𝐀𝐋𝐈𝐕𝐄 𝐀𝐍𝐃 𝐏𝐎𝐖𝐄𝐑𝐅𝐔𝐋𝐋.
│
│ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐕2.0.0 STABLE
│
│ ⚡ 𝐁𝐨𝐭 𝐢𝐬 𝐀𝐜𝐭𝐢𝐯𝐞 & 𝐑𝐮𝐧𝐧𝐢𝐧𝐠
│ 🥀 𝐍𝐨 𝐋𝐚𝐠 - 𝐒𝐮𝐩𝐞𝐫 𝐅𝐚𝐬𝐭
│ 👑 𝐃𝐨𝐦𝐢𝐧𝐚𝐭𝐢𝐧𝐠 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩
╰───────────────❍

> 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐓𝐎𝐑𝐌 𝐗`

  let img="https://files.catbox.moe/ssnist.jpg"
  let jid="120363414065055650@newsletter"
  let channelUrl="https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P"

  await sock.sendMessage(m.chat,{
    image:{url:img},
    caption:caption,
    mentions:[m.sender],
    contextInfo:{
      isForwarded:true,
      forwardedNewsletterMessageInfo:{
        newsletterJid:jid,
        newsletterName:"STORM CYBER MD",
        serverMessageId:1
      },
      externalAdReply:{
        title:"STORM CYBER MD - ALIVE",
        body:"Tap to Follow Channel",
        thumbnailUrl:img,
        sourceUrl:channelUrl,
        mediaType:1,
        renderLargerThumbnail:true
      }
    }
  },{quoted:m})

  // extra view channel button style message
  await sock.sendMessage(m.chat,{
    text:`📢 Follow the STORM CYBER MD channel on WhatsApp: ${channelUrl}`,
    contextInfo:{
      forwardedNewsletterMessageInfo:{
        newsletterJid:jid,
        newsletterName:"STORM CYBER MD",
        serverMessageId:1
      }
    }
  })

 }catch(e){ console.log(e) }
}
}
