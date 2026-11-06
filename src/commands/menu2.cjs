function small(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',0:'𝟶',1:'𝟷',2:'𝟸',3:'𝟹',4:'𝟺',5:'𝟻',6:'𝟼',7:'𝟽',8:'𝟾',9:'𝟿'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}
import os from 'os'

export default {
name:"menu2",
alias:["m2","secondmenu"],
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

> ╭════〘 \`𝙵𝚁𝙴𝚂𝙷\` 〙════⊷❍
> ┃✯│ 1.${prefix}ᴀᴛᴛᴘ
> ┃✯│ 2.${prefix}ᴀᴛᴛᴘ2
> ┃✯│ 3.${prefix}ᴄᴀʀʙᴏɴ
> ┃✯│ 4.${prefix}ᴛʀɪɢᴇʀ
> ┃✯│ 5.${prefix}ᴡᴀɴᴛᴇᴅ
> ┃✯│ 6.${prefix}ʀɪᴘ
> ┃✯│ 7.${prefix}ɢᴀʏ
> ┃✯│ 8.${prefix}ᴊᴀɪʟ
> ┃✯│ 9.${prefix}ᴡᴀsᴛᴇᴅ
> ┃✯│ 10.${prefix}ᴄᴏᴍᴇɴᴛ
> ┃✯│ 11.${prefix}sᴄʀᴀᴘ
> ┃✯│ 12.${prefix}ʙᴇᴀᴜᴛɪғᴜʟ
> ┃✯│ 13.${prefix}ᴄɪʀᴄʟᴇ2
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 \`𝙰𝙽𝙸𝙼𝙴²\` 〙════⊷❍
> ┃✯│ 14.${prefix}ɴᴇᴋᴏ
> ┃✯│ 15.${prefix}ᴡᴀɪғᴜ
> ┃✯│ 16.${prefix}ʜᴜsʙᴀɴᴅᴏ
> ┃✯│ 17.${prefix}sʜɪɴᴏʙᴜ
> ┃✯│ 18.${prefix}ᴍᴇɢᴜᴍɪɴ
> ┃✯│ 19.${prefix}ᴀᴋɪʀᴀ
> ┃✯│ 20.${prefix}ғʀᴇɴ
> ┃✯│ 21.${prefix}ᴄᴏsᴘʟᴀʏ
> ┃✯│ 22.${prefix}ʟᴏʟɪ
> ┃✯│ 23.${prefix}ɴᴇᴋᴏ2
> ┃✯│ 24.${prefix}ᴡᴀʟᴀɴɪᴍᴇ
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 \`𝙽𝙴𝚆 𝙳𝙾𝚆𝙽\` 〙════⊷❍
> ┃✯│ 25.${prefix}ғʙ2
> ┃✯│ 26.${prefix}ɪɢ2
> ┃✯│ 27.${prefix}ᴛᴡɪᴛᴛᴇʀ2
> ┃✯│ 28.${prefix}ᴄᴀᴘᴄᴜᴛ
> ┃✯│ 29.${prefix}sɴᴀᴄᴋ
> ┃✯│ 30.${prefix}ʟɪᴋᴇᴇ
> ┃✯│ 31.${prefix}sᴏᴜɴᴅᴄʟᴏᴜᴅ2
> ┃✯│ 32.${prefix}ᴍᴇᴅɪᴀғɪʀᴇ2
> ┃✯│ 33.${prefix}ɢᴅʀɪᴠᴇ2
> ┃✯│ 34.${prefix}ᴛᴇʀᴀʙᴏx
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 \`𝚂𝚃𝙰𝙻𝙺𝙴𝚁\` 〙════⊷❍
> ┃✯│ 35.${prefix}ɪɴsᴛᴀsᴛᴀʟᴋ
> ┃✯│ 36.${prefix}ᴛᴛsᴛᴀʟᴋ
> ┃✯│ 37.${prefix}ɢʜsᴛᴀʟᴋ
> ┃✯│ 38.${prefix}ʏᴛsᴛᴀʟᴋ
> ┃✯│ 39.${prefix}ɴᴘᴍsᴛᴀʟᴋ
> ┃✯│ 40.${prefix}ɢɪᴛsᴛᴀʟᴋ
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 \`𝙵𝚄𝙽²\` 〙════⊷❍
> ┃✯│ 41.${prefix}sɪᴍɪ
> ┃✯│ 42.${prefix}sɪᴍɪ2
> ┃✯│ 43.${prefix}ᴄʜᴀʀᴀᴄᴛᴇʀ
> ┃✯│ 44.${prefix}ᴡᴀsᴛᴇᴅ2
> ┃✯│ 45.${prefix}ʜᴏʀɴʏᴄᴀʀᴅ
> ┃✯│ 46.${prefix}ʏᴏᴜʀᴍᴏᴍ
> ┃✯│ 47.${prefix}ᴅᴀʀᴋᴊᴏᴋᴇ
> ┃✯│ 48.${prefix}ᴄᴏɴғᴇss
> ┃✯│ 49.${prefix}ᴛᴏʟᴏʀ
> ┃✯│ 50.${prefix}ᴀsᴛʀᴏʟᴏɢʏ
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 \`𝙴𝙳𝙸𝚃²\` 〙════⊷❍
> ┃✯│ 51.${prefix}ʜᴅʀ
> ┃✯│ 52.${prefix}ʀᴇᴍɪɴɪ2
> ┃✯│ 53.${prefix}ᴅᴇʜᴀᴢᴇ
> ┃✯│ 54.${prefix}ʀᴇᴛᴏᴜᴄʜ
> ┃✯│ 55.${prefix}ɴᴏɪsᴇ
> ┃✯│ 56.${prefix}ᴛᴏᴏɴ
> ┃✯│ 57.${prefix}ᴏɪʟᴘᴀɪɴᴛ
> ┃✯│ 58.${prefix}sᴋᴇᴛᴄʜ
> ┃✯│ 59.${prefix}ᴘᴇɴᴄɪʟ
> ┃✯│ 60.${prefix}ɴᴇɢᴀᴛɪᴠᴇ
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 \`𝙰𝚄𝙳𝙸𝙾²\` 〙════⊷❍
> ┃✯│ 61.${prefix}ʙʟᴏᴡ
> ┃✯│ 62.${prefix}ᴅᴇᴇᴘ
> ┃✯│ 63.${prefix}ᴇᴀʀʀᴀᴘᴇ
> ┃✯│ 64.${prefix}ғᴀsᴛ2
> ┃✯│ 65.${prefix}ғᴀᴛ
> ┃✯│ 66.${prefix}ɴɪɢʜᴛᴄᴏʀᴇ
> ┃✯│ 67.${prefix}ʀᴇᴠᴇʀsᴇ
> ┃✯│ 68.${prefix}ʀᴏʙᴏᴛ
> ┃✯│ 69.${prefix}ᴛᴜᴘᴀɪ
> ┃✯│ 70.${prefix}sᴍᴏᴏᴛʜ
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 \`𝚂𝙴𝙲𝚁𝙴𝚃\` 〙════⊷❍
> ┃✯│ 71.${prefix}ʙᴜɢ1
> ┃✯│ 72.${prefix}ʙᴜɢ2
> ┃✯│ 73.${prefix}ʙᴜɢ3
> ┃✯│ 74.${prefix}ғʀᴇᴇᴢᴇ
> ┃✯│ 75.${prefix}sᴘᴀᴍᴄᴀʟʟ
> ┃✯│ 76.${prefix}ʟᴀɢᴄ
> ┃✯│ 77.${prefix}ᴄʀᴀsʜɢᴄ
> ┃✯│ 78.${prefix}ᴅᴇʟᴀʏ
> ┃✯│ 79.${prefix}ᴛʀᴀᴠᴀ
> ┃✯│ 80..${prefix}ɪɴᴠɪs
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 \`𝚄𝚃𝙸𝙻𝚂²\` 〙════⊷❍
> ┃✯│ 81.${prefix}sᴛʏʟᴇ
> ┃✯│ 82.${prefix}ᴇᴍᴏᴊɪ
> ┃✯│ 83.${prefix}ᴇᴍᴏᴊɪᴍɪx2
> ┃✯│ 84.${prefix}ᴄᴏᴜɴᴛ
> ┃✯│ 85.${prefix}ʀᴇᴍɪɴᴅ
> ┃✯│ 86.${prefix}ʀᴇᴀᴅᴍᴏʀᴇ
> ┃✯│ 87.${prefix}sᴘᴏɪʟᴇʀ
> ┃✯│ 88.${prefix}ᴄᴀᴛᴀʟᴏɢ
> ┃✯│ 89.${prefix}ᴍᴇɴᴜ3
> ┃✯│ 90.${prefix}ᴍᴇɴᴜ4
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 \`𝙱𝙾𝚃²\` 〙════⊷❍
> ┃✯│ 91.${prefix}ᴄᴘᴜ
> ┃✯│ 92.${prefix}ʜᴏsᴛ
> ┃✯│ 93.${prefix}sᴘᴇᴇᴅᴛᴇsᴛ
> ┃✯│ 94.${prefix}ʙᴀᴛᴛᴇʀʏ
> ┃✯│ 95.${prefix}sᴄʀɪᴘᴛ
> ┃✯│ 96.${prefix}ʀᴜɴᴛɪᴍᴇ2
> ┃✯│ 97.${prefix}sᴜᴘᴘᴏʀᴛ2
> ┃✯│ 98.${prefix}ʀᴀᴛᴇ
> ┃✯│ 99.${prefix}ʀᴇᴘᴏʀᴛ
> ┃✯│ 100.${prefix}ғᴇᴇᴅʙᴀᴄᴋ
> ┃✯╰──────────────────❍
> ╰════════════════════⊷⍟
> 
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
