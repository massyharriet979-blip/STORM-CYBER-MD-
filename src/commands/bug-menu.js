function small(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',0:'𝟶',1:'𝟷',2:'𝟸',3:'𝟹',4:'𝟺',5:'𝟻',6:'𝟼',7:'𝟽',8:'𝟾',9:'𝟿'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}
import os from 'os'

export default {
name:"bug-menu",
alias:["bug-menu","bug-menu"],
execute: async(sock, m, args)=>{
 try{
  const up = process.uptime()
  const d = Math.floor(up/86400)
  const h = Math.floor((up%86400)/3600)
  const mm = Math.floor((up%3600)/60)
  const s = Math.floor(up%60)
  const uptime = `${d}d ${h}h ${mm}m ${s}s`

  const usedRam = (process.memoryUsage().heapUsed/1024/1024).toFixed(2)
  const totalRam = "36"
  const now = new Date()
  const date = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`
  const day = now.toLocaleDateString('en-US',{weekday:'long'})
  const prefix = global.prefix || "."
  const botMode = global.publicMode? "public" : global.selfMode? "self" : "private"
  const pushuser = m.pushName || "User"
  const ownerName = "sᴛᴏʀᴍ 𝐗"

  let text = `> ╭══〘 sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ〙 ══⊷❍
> ┃✯╭──────────────
> ┃✯│ ᴏᴡɴᴇʀ : \`${ownerName}\`
> ┃✯│ ᴜsᴇʀ : ${pushuser}
> ┃✯│ ᴍᴏᴅᴇ : ${botMode}
> ┃✯│ sᴇʀᴠᴇʀ : sᴛᴏʀᴍ ᴄʟᴏᴜᴅ
> ┃✯│ ʀᴀᴍ : ${usedRam} ᴍʙ ᴏғ ${totalRam} ɢʙ
> ┃✯│ ᴄᴏᴍᴍᴀɴᴅs: \`100\`
> ┃✯│ ᴠᴇʀsɪᴏɴ : ᴠ3.0.0 sᴛᴀʙʟᴇ
> ┃✯│ ᴘʀᴏᴊᴇᴄᴛ: ᴄʏʙᴇʀ sᴇᴄᴜʀɪᴛʏ ʙᴏᴛ
> ┃✯│ ᴅᴀᴛᴇ : ${date}
> ┃✯│ ᴜᴘᴛɪᴍᴇ : ${d}d ${h}h ${mm}m ${s}s
> ┃✯│ sᴛᴀᴛᴜs : ᴏɴʟɪɴᴇ
> ┃✯│ ᴘʀᴇғɪx : ${prefix}
> ┃✯│ ᴅᴀʏ : ${day}
> ┃✯╰───────────────
> ╰═══════════════════⊷❍

> ╭════〘 ʙᴜɢ ᴍᴇɴᴜ 〙════⊷❍
> ┃✯│ 1.${prefix} *ɪᴏs-ʙᴜɢ
> ╰══════════════════⊷❍
> ╭═════〘 ʙᴜɢ ᴍᴇɴᴜ 〙═══⊷❍
> ┃✯│ 2.${prefix} **𝙰𝙽𝙳𝚁𝙾-𝙱𝚄𝙶*
> ╰══════════════════⊷❍
> ╭═════〘 ʙᴜɢ ᴍᴇɴᴜ 〙════⊷❍
> ┃✯│3.${prefix} **𝙶𝚁𝙾𝚄𝙿-𝙱𝚄𝙶*
> ╰═══════════════════⊷❍
> ┃◆ © *`ᴘᴏᴡᴇʀᴇᴅ ʙʏ STORM CYBER MD`
> ╰════════════════════⊷❍
`

  await sock.sendMessage(m.chat,{
   image:{url:"https://files.catbox.moe/pznw3z.jpg"},
   caption:text,
   contextInfo:{
    isForwarded:true,
    forwardedNewsletterMessageInfo:{
     newsletterJid:"120363414065055650@newsletter",
     newsletterName:"STORM CYBER MD",
     serverMessageId:1
    }
   }
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
